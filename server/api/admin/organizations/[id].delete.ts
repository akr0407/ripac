import { eq } from 'drizzle-orm';
import { organizations } from '../../../db/schema/organizations';
import { db } from '../../../db';

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);
    const id = getRouterParam(event, 'id');
    if (!session.user.isSuperadmin) {
        throw createError({ statusCode: 403, message: 'Superadmin access required' });
    }

    try {
        // Check if org can be deleted? (Foreign key constraints usually handle this or we error)
        // For now, allow deletion. Database should cascade or error if children exist.
        // If you want safer delete, check dependencies first.

        await db.delete(organizations)
            .where(eq(organizations.id, id as string));

        return { success: true };
    } catch (e) {
        console.error('Delete org error:', e);
        throw createError({ statusCode: 500, message: 'Failed to delete organization' });
    }
});
