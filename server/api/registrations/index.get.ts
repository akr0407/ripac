import { db } from '../../db';
import { registrations, patients } from '../../db/schema';
import { eq } from 'drizzle-orm';

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
        .where(eq(registrations.organizationId, orgId));

    return { data };
});
