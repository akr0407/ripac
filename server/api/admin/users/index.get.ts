import { db } from '../../../db';
import { users } from '../../../db/schema';

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

    const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        isSuperadmin: users.isSuperadmin,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
    }).from(users);

    return {
        users: allUsers,
    };
});
