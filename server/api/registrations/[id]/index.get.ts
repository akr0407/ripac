import { db } from '../../../db';
import { registrations, patients } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Registration ID is required',
            });
        }

        const [registration] = await db
            .select({
                id: registrations.id,
                registrationNumber: registrations.registrationNumber,
                admissionDate: registrations.admissionDate,
                dischargeDate: registrations.dischargeDate,
                ward: registrations.ward,
                createdAt: registrations.createdAt,
                patientId: registrations.patientId,
                patient: {
                    id: patients.id,
                    fullName: patients.fullName,
                    mrNumber: patients.mrNumber,
                    phone: patients.phone,
                    age: patients.age,
                    ageUnit: patients.ageUnit,
                    sex: patients.sex,
                    nationality: patients.nationality,
                    currentAddress: patients.currentAddress,
                },
            })
            .from(registrations)
            .leftJoin(patients, eq(registrations.patientId, patients.id))
            .where(eq(registrations.id, id));

        if (!registration) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Registration not found',
            });
        }

        return {
            success: true,
            data: registration,
        };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch registration',
        });
    }
});
