import { z } from 'zod';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { getUserByEmail, verifyPasswordLocal, type UserSession } from '../../utils/auth';
import { logAuditAction } from '../../utils/audit';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0]?.message || 'Invalid input',
        });
    }

    const { email, password } = result.data;

    // Find user
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Invalid email or password',
        });
    }

    // Check if user has a password (not SSO-only)
    if (!user.passwordHash) {
        throw createError({
            statusCode: 401,
            message: 'This account uses SSO login. Please use the SSO login button.',
        });
    }


    // Verify password
    const isValid = await verifyPasswordLocal(password, user.passwordHash);

    if (!isValid) {
        try {
            const fs = await import('fs');
            const path = await import('path');
            const logPath = path.resolve(process.cwd(), 'server-debug.log');
            const inputHash = await import('../../utils/auth').then(m => m.hashPasswordLocal(password));

            const logMessage = `
[${new Date().toISOString()}] Login Failed:
Email: ${email}
Input Length: ${password.length}
Stored Hash: ${user.passwordHash}
Input Hash:  ${inputHash}
Input Password: ${password.substring(0, 1) + '***' + password.substring(password.length - 1)}
----------------------------------------
`;
            fs.appendFileSync(logPath, logMessage);
        } catch (e) {
            console.error('Failed to write debug log', e);
        }

        throw createError({
            statusCode: 401,
            message: 'Invalid email or password',
        });
    }


    // Check if user is active
    if (!user.isActive) {
        throw createError({
            statusCode: 403,
            message: 'Your account has been deactivated. Please contact an administrator.',
        });
    }

    // Update last login
    await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

    // Get user with organizations
    const userWithOrgs = await getUserByEmail(email);

    // Create session
    const session: UserSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperadmin: user.isSuperadmin,
        currentOrganizationId: userWithOrgs?.organizations[0]?.id,
        currentOrganizationSlug: userWithOrgs?.organizations[0]?.slug,
    };

    await setUserSession(event, { user: session });

    // Log audit action
    await logAuditAction(event, {
        userId: user.id,
        organizationId: session.currentOrganizationId,
        action: 'login',
        entityType: 'user',
        entityId: user.id,
    });

    return {
        user: userWithOrgs,
        message: 'Login successful',
    };
});
