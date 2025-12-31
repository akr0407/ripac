import { db } from '../../../db';
import { patients } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updatePatientSchema = z.object({
    registrationNumber: z.string().optional(),
    mrNumber: z.string().optional().nullable(),
    fullName: z.string().optional(),
    phone: z.string().optional().nullable(),
    age: z.number().optional().nullable(),
    ageUnit: z.enum(['years', 'months', 'days']).optional(),
    nationality: z.string().optional().nullable(),
    sex: z.enum(['male', 'female']).optional().nullable(),
    admissionDate: z.string().optional().nullable(),
    dischargeDate: z.string().optional().nullable(),
    ward: z.string().optional().nullable(),
    currentAddress: z.string().optional().nullable(),
});

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Patient ID is required',
            });
        }

        const body = await readBody(event);
        const validatedData = updatePatientSchema.parse(body);

        const [updatedPatient] = await db
            .update(patients)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(eq(patients.id, id))
            .returning();

        if (!updatedPatient) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Patient not found',
            });
        }

        return {
            success: true,
            data: updatedPatient,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Validation failed',
                data: error.errors,
            });
        }
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update patient',
        });
    }
});
