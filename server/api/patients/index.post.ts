import { db } from '../../db';
import { patients } from '../../db/schema';
import { z } from 'zod';

const createPatientSchema = z.object({
    registrationNumber: z.string().min(1, 'Registration number is required'),
    mrNumber: z.string().optional(),
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().optional(),
    age: z.number().optional(),
    ageUnit: z.enum(['years', 'months', 'days']).default('years'),
    nationality: z.string().optional(),
    sex: z.enum(['male', 'female']).optional(),
    admissionDate: z.string().optional(),
    ward: z.string().optional(),
    currentAddress: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const validatedData = createPatientSchema.parse(body);

        const [newPatient] = await db
            .insert(patients)
            .values({
                ...validatedData,
                admissionDate: validatedData.admissionDate || null,
            })
            .returning();

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
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create patient',
        });
    }
});
