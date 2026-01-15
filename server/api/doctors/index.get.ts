import { db } from '../../db';
import { doctors } from '../../db/schema';
import { eq, like, ilike, or, count, and } from 'drizzle-orm';

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
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const search = (query.q as string) || '';

    const offset = (page - 1) * limit;

    // Build where condition
    const whereCondition = and(
        eq(doctors.organizationId, orgId),
        search ? or(
            ilike(doctors.fullName, `%${search}%`),
            ilike(doctors.doctorId, `%${search}%`),
            ilike(doctors.nickName, `%${search}%`)
        ) : undefined
    );

    // Get total count
    const [totalResult] = await db
        .select({ count: count() })
        .from(doctors)
        .where(whereCondition);

    const total = totalResult?.count || 0;
    const totalPages = Math.ceil(total / limit);

    // Get data
    const data = await db
        .select()
        .from(doctors)
        .where(whereCondition)
        .limit(limit)
        .offset(offset);

    return {
        data,
        total,
        page,
        limit,
        totalPages
    };
});
