import { db } from '../../../db';
import { registrations } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateRegistrationSchema = z.object({
    ward: z.string().optional(),
    admissionDate: z.string().optional().nullable(),
    dischargeDate: z.string().optional().nullable(),
});

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Registration ID is required',
            });
        }

        const body = await readBody(event);
        const data = updateRegistrationSchema.parse(body);

        const [result] = await db
            .update(registrations)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(registrations.id, id))
            .returning();

        if (!result) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Registration not found',
            });
        }

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Validation failed',
            });
        }
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update registration',
        });
    }
});
