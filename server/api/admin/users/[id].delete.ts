import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { logAuditAction } from '../../../utils/audit';

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);
    const userId = getRouterParam(event, 'id');

    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Not authenticated',
        });
    }

    if (!session.user.isSuperadmin) {
        throw createError({
            statusCode: 403,
            message: 'Superadmin access required',
        });
    }

    if (!userId) {
        throw createError({
            statusCode: 400,
            message: 'User ID is required',
        });
    }
    
    // Prevent deleting self
    if (userId === session.user.id) {
        throw createError({
            statusCode: 400,
            message: 'Cannot delete your own account',
        });
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!existingUser) {
        throw createError({
            statusCode: 404,
            message: 'User not found',
        });
    }

    // Delete user (cascades to memberships)
    await db.delete(users).where(eq(users.id, userId));

    // Log audit action
    await logAuditAction(event, {
        userId: session.user.id,
        action: 'delete',
        entityType: 'user',
        entityId: userId,
        changes: {
            before: {
                email: existingUser.email,
                name: existingUser.name,
            }
        },
    });

    return {
        success: true,
        message: 'User deleted successfully',
    };
});
