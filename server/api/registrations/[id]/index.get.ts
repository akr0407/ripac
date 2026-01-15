import { db } from '../../../db';
import { registrations, patients, organizations, doctors } from '../../../db/schema';
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
                managerOnDutyId: registrations.managerOnDutyId,
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
                organization: {
                    name: organizations.name,
                    logo: organizations.logo,
                    address: organizations.address,
                    phone: organizations.phone,
                    email: organizations.email,
                },
                managerOnDuty: {
                    id: doctors.id,
                    fullName: doctors.fullName,

                }
            })
            .from(registrations)
            .leftJoin(patients, eq(registrations.patientId, patients.id))
            .leftJoin(organizations, eq(registrations.organizationId, organizations.id))
            .leftJoin(doctors, eq(registrations.managerOnDutyId, doctors.id))
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
