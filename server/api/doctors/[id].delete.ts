import { db } from '../../db';
import { doctors } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);
    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Not authenticated' });
    }

    const orgId = session.user.currentOrganizationId;
    if (!orgId) {
        throw createError({ statusCode: 400, message: 'No organization selected' });
    }

    const id = event.context.params?.id;
    if (!id) {
        throw createError({ statusCode: 400, message: 'ID is required' });
    }

    const [deleted] = await db.delete(doctors)
        .where(and(
            eq(doctors.id, id),
            eq(doctors.organizationId, orgId)
        ))
        .returning();

    if (!deleted) {
        throw createError({ statusCode: 404, message: 'Doctor not found' });
    }

    return { success: true, data: deleted };
});
