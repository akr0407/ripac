import { db } from '../../db';
import { doctors } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateDoctorSchema = z.object({
    doctorId: z.string().min(1).optional(),
    nickName: z.string().optional(),
    fullName: z.string().min(1).optional(),
    address: z.string().optional(),
    phone1: z.string().optional(),
    phone2: z.string().optional(),
    isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Doctor ID is required',
            });
        }

        const body = await readBody(event);
        const validatedData = updateDoctorSchema.parse(body);

        const [updatedDoctor] = await db
            .update(doctors)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(eq(doctors.id, id))
            .returning();

        if (!updatedDoctor) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Doctor not found',
            });
        }

        return {
            success: true,
            data: updatedDoctor,
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
            statusMessage: 'Failed to update doctor',
        });
    }
});
