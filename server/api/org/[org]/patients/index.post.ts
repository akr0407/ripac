import { db } from '../../../../db';
import { patients, registrations } from '../../../../db/schema';
import { z } from 'zod';
import { getOrganizationContext } from '../../../../utils/organization';
import { logAuditAction } from '../../../../utils/audit';

const createPatientSchema = z.object({
    registrationNumber: z.string().min(1, 'Registration number is required'),
    mrNumber: z.string().optional(),
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().optional(),
    age: z.number().optional(),
    ageUnit: z.enum(['years', 'months', 'days']).default('years'),
    nationality: z.string().optional(),
    sex: z.enum(['male', 'female']).optional(),
    dateOfBirth: z.string().optional(),
    admissionDate: z.string().optional(),
    ward: z.string().optional(),
    currentAddress: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const orgContext = await getOrganizationContext(event);
    const session = await getUserSession(event);

    try {
        const body = await readBody(event);
        const validatedData = createPatientSchema.parse(body);

        // Create patient with organization ID
        const [newPatient] = await db
            .insert(patients)
            .values({
                organizationId: orgContext.organizationId,
                mrNumber: validatedData.mrNumber,
                fullName: validatedData.fullName,
                phone: validatedData.phone,
                age: validatedData.age,
                ageUnit: validatedData.ageUnit,
                nationality: validatedData.nationality,
                sex: validatedData.sex,
                dateOfBirth: validatedData.dateOfBirth,
                currentAddress: validatedData.currentAddress,
            })
            .returning();

        // Create initial registration
        await db.insert(registrations).values({
            organizationId: orgContext.organizationId,
            patientId: newPatient.id,
            registrationNumber: validatedData.registrationNumber,
            admissionDate: validatedData.admissionDate,
            ward: validatedData.ward,
        });

        // Log audit action
        await logAuditAction(event, {
            userId: session?.user?.id,
            organizationId: orgContext.organizationId,
            action: 'create',
            entityType: 'patient',
            entityId: newPatient.id,
            changes: { after: validatedData },
        });

        return {
            success: true,
            data: newPatient,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Validation failed',
                data: error.errors,
            });
        }
        console.error('Failed to create patient:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create patient',
        });
    }
});
