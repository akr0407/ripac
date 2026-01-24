import { z } from 'zod';
import { db } from '../../../db';
import { users, memberships } from '../../../db/schema';
import { eq, ne, and } from 'drizzle-orm';

import { hashPasswordLocal } from '../../../utils/auth';
import { logAuditAction } from '../../../utils/audit';

const updateUserSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    name: z.string().min(1, 'Name is required').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    isActive: z.boolean().optional(),
    organizationId: z.string().uuid().optional(),
    role: z.enum(['owner', 'admin', 'member', 'readonly']).optional(),
    previousOrganizationId: z.string().uuid().nullable().optional(),
});

export default defineEventHandler(async (event) => {
    // ... [existing session/check logic]
    const session = await getUserSession(event);
    const userId = getRouterParam(event, 'id');

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Not authenticated' });
    }
    if (!session.user.isSuperadmin) {
        throw createError({ statusCode: 403, message: 'Superadmin access required' });
    }
    if (!userId) {
        throw createError({ statusCode: 400, message: 'User ID is required' });
    }

    const body = await readBody(event);
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0]?.message || 'Invalid input',
        });
    }

    const { email, name, password, isActive, organizationId, role, previousOrganizationId } = result.data;

    // Check user
    const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });
    if (!existingUser) {
        throw createError({ statusCode: 404, message: 'User not found' });
    }

    // Email check
    if (email && email !== existingUser.email) {
        const emailTaken = await db.query.users.findFirst({
            where: eq(users.email, email),
        });
        if (emailTaken) {
            throw createError({ statusCode: 409, message: 'Email is already registered' });
        }
    }

    // Update User
    const updates: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };
    if (email) updates.email = email;
    if (name) updates.name = name;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (password) {
        updates.passwordHash = await hashPasswordLocal(password);
    }

    const [updatedUser] = await db.update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning();

    // Handle Organization/Role update
    if (organizationId && role) {
        // If changing organizations (and previous organization is known)
        if (previousOrganizationId && previousOrganizationId !== organizationId) {
            await db.delete(memberships)
                .where(and(
                    eq(memberships.userId, userId),
                    eq(memberships.organizationId, previousOrganizationId)
                ));
        }

        // Upsert new membership
        await db.insert(memberships)
            .values({
                userId,
                organizationId,
                role,
                joinedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [memberships.userId, memberships.organizationId],
                set: { role, updatedAt: new Date() },
            });
    }

    // Log audit action
    await logAuditAction(event, {
        userId: session.user.id,
        action: 'update',
        entityType: 'user',
        entityId: userId,
        changes: {
             before: {
                email: existingUser.email,
                name: existingUser.name,
                isActive: existingUser.isActive
            },
            after: {
                email: updatedUser.email,
                name: updatedUser.name,
                isActive: updatedUser.isActive,
                organizationId,
                role
            }
        },
    });

    return {
        success: true,
        user: updatedUser,
        message: 'User updated successfully',
    };
});
