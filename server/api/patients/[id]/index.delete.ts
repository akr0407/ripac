import { db } from '../../../db';
import {
    patients,
    registrations,
    medicalHistory,
    vitalSigns,
    examinations,
    doctorRecommendations,
    treatingDoctors,
    comments
} from '../../../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

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

    const patientId = getRouterParam(event, 'id');

    if (!patientId) {
        throw createError({
            statusCode: 400,
            message: 'Patient ID is required',
        });
    }

    // Verify patient exists and belongs to organization
    const existingPatient = await db.query.patients.findFirst({
        where: and(
            eq(patients.id, patientId),
            eq(patients.organizationId, orgId)
        ),
    });

    if (!existingPatient) {
        throw createError({
            statusCode: 404,
            message: 'Patient not found',
        });
    }

    try {
        await db.transaction(async (tx) => {
            // 1. Find all registrations for this patient
            const patientRegistrations = await tx
                .select({ id: registrations.id })
                .from(registrations)
                .where(eq(registrations.patientId, patientId));

            const registrationIds = patientRegistrations.map(r => r.id);

            if (registrationIds.length > 0) {
                // 2. Delete all related records for these registrations
                // Order doesn't strictly matter for these as they don't depend on each other,
                // but they all depend on registration.

                await tx.delete(medicalHistory).where(inArray(medicalHistory.registrationId, registrationIds));
                await tx.delete(vitalSigns).where(inArray(vitalSigns.registrationId, registrationIds));
                await tx.delete(examinations).where(inArray(examinations.registrationId, registrationIds));
                await tx.delete(doctorRecommendations).where(inArray(doctorRecommendations.registrationId, registrationIds));
                await tx.delete(treatingDoctors).where(inArray(treatingDoctors.registrationId, registrationIds));
                await tx.delete(comments).where(inArray(comments.registrationId, registrationIds));

                // 3. Delete registrations
                await tx.delete(registrations).where(inArray(registrations.id, registrationIds));
            }

            // 4. Delete the patient
            await tx.delete(patients).where(eq(patients.id, patientId));
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to delete patient:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to delete patient',
        });
    }
});
