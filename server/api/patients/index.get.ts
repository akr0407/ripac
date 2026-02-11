import { db } from '../../db';
import { patients } from '../../db/schema';
import { eq, and, or, ilike, count } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Not authenticated',
        });
    }

    const orgId = session.user.currentOrganizationId;

    if (!orgId) {
        throw createError({
            statusCode: 400,
            message: 'No organization selected',
        });
    }

    // Get query parameters
    const query = getQuery(event);
    const search = (query.q as string) || '';
    const limit = parseInt(query.limit as string) || 20;

    const whereCondition = and(
        eq(patients.organizationId, orgId),
        search ? or(
            ilike(patients.fullName, `%${search}%`),
            ilike(patients.mrNumber, `%${search}%`)
        ) : undefined
    );

    // Get total count
    const [totalResult] = await db
        .select({ count: count() })
        .from(patients)
        .where(whereCondition);

    const total = totalResult?.count || 0;

    const data = await db
        .select()
        .from(patients)
        .where(whereCondition)
        .limit(limit);

    return { data, total };
});
