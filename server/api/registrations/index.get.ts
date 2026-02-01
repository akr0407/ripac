import { db } from '../../db';
import { registrations, patients } from '../../db/schema';
import { eq, and, or, ilike } from 'drizzle-orm';

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
        .where(whereCondition);

    return { data };
});
