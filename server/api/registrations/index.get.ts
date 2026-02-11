import { db } from '../../db';
import { registrations, patients } from '../../db/schema';
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

    const whereCondition = and(
        eq(registrations.organizationId, orgId),
        search ? or(
            ilike(registrations.registrationNumber, `%${search}%`),
            ilike(patients.fullName, `%${search}%`),
            ilike(patients.mrNumber, `%${search}%`)
        ) : undefined
    );

    // Get total count
    const [totalResult] = await db
        .select({ count: count() })
        .from(registrations)
        .leftJoin(patients, eq(registrations.patientId, patients.id))
        .where(whereCondition);

    const total = totalResult?.count || 0;

    // Pagination (using limit from query or default 20)
    const limit = parseInt((query.limit as string) || '20');
    const page = parseInt((query.page as string) || '1');
    const offset = (page - 1) * limit;

    const data = await db
        .select({
            id: registrations.id,
            patientId: registrations.patientId,
            patientName: patients.fullName,
            patientMrNumber: patients.mrNumber,
            registrationNumber: registrations.registrationNumber,
            admissionDate: registrations.admissionDate,
            createdAt: registrations.createdAt,
        })
        .from(registrations)
        .leftJoin(patients, eq(registrations.patientId, patients.id))
        .where(whereCondition)
        .limit(limit)
        .offset(offset)
        .orderBy(registrations.createdAt);

    return { data, total };
});
