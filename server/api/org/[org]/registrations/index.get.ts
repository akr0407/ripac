import { db } from '../../../../db';
import { registrations, patients } from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { getOrganizationContext } from '../../../../utils/organization';

export default defineEventHandler(async (event) => {
    const orgContext = await getOrganizationContext(event);

    try {
        const allRegistrations = await db
            .select({
                id: registrations.id,
                registrationNumber: registrations.registrationNumber,
                admissionDate: registrations.admissionDate,
                dischargeDate: registrations.dischargeDate,
                ward: registrations.ward,
                createdAt: registrations.createdAt,
                updatedAt: registrations.updatedAt,
                patient: {
                    id: patients.id,
                    mrNumber: patients.mrNumber,
                    fullName: patients.fullName,
                    phone: patients.phone,
                    age: patients.age,
                    ageUnit: patients.ageUnit,
                    sex: patients.sex,
                },
            })
            .from(registrations)
            .innerJoin(patients, eq(registrations.patientId, patients.id))
            .where(eq(registrations.organizationId, orgContext.organizationId))
            .orderBy(desc(registrations.createdAt));

        return {
            success: true,
            data: allRegistrations,
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch registrations',
        });
    }
});
