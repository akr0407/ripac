import { z } from 'zod';
import { db } from '../../../db';
import { users, memberships, organizations } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { hashPasswordLocal } from '../../../utils/auth';
import { logAuditAction } from '../../../utils/audit';

const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(1, 'Name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    organizationId: z.string().uuid('Invalid organization ID'),
    role: z.enum(['owner', 'admin', 'member', 'readonly']).default('member'),
});

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Not authenticated',
        });
    }

    // Check if user is superadmin
    if (!session.user.isSuperadmin) {
        throw createError({
            statusCode: 403,
            message: 'Superadmin access required',
        });
    }

    const body = await readBody(event);

    // Validate input
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0]?.message || 'Invalid input',
        });
    }

    const { email, name, password, organizationId, role } = result.data;

    // Check if organization exists
    const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, organizationId),
    });

    if (!org) {
        throw createError({
            statusCode: 404,
            message: 'Organization not found',
        });
    }

    // Check if email is already taken
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        throw createError({
            statusCode: 409,
            message: 'Email is already registered',
        });
    }

    // Hash password
    const passwordHash = await hashPasswordLocal(password);

    // Create user
    const [newUser] = await db.insert(users).values({
        email,
        name,
        passwordHash,
        emailVerifiedAt: new Date(),
    }).returning();

    // Create membership
    await db.insert(memberships).values({
        userId: newUser.id,
        organizationId,
        role,
        joinedAt: new Date(),
    });

    // Log audit action
    await logAuditAction(event, {
        userId: session.user.id,
        organizationId,
        action: 'create',
        entityType: 'user',
        entityId: newUser.id,
        changes: { after: { email, name, role } },
    });

    return {
        success: true,
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
        },
        message: 'User created successfully',
    };
});
