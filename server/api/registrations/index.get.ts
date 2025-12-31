import { db } from '../../db';
import { registrations, patients } from '../../db/schema';
import { desc, eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const result = await db
            .select({
                id: registrations.id,
                registrationNumber: registrations.registrationNumber,
                admissionDate: registrations.admissionDate,
                dischargeDate: registrations.dischargeDate,
                ward: registrations.ward,
                createdAt: registrations.createdAt,
                patientId: registrations.patientId,
                patientName: patients.fullName,
                patientMrNumber: patients.mrNumber,
            })
            .from(registrations)
            .leftJoin(patients, eq(registrations.patientId, patients.id))
            .orderBy(desc(registrations.createdAt));

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch registrations',
        });
    }
});
