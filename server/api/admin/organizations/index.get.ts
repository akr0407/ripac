import { db } from '../../../db';
import { organizations } from '../../../db/schema';

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

    const orgs = await db.select().from(organizations);

    return {
        organizations: orgs,
    };
});
