import { db } from '../../../../db';
import { medicalHistory } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const historySchema = z.object({
    presentComplaint: z.string().optional(),
    pastMedicalHistory: z.string().optional(),
    allergicHistory: z.string().optional(),
    currentMedication: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const patientId = getRouterParam(event, 'id');

        if (!patientId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Patient ID is required',
            });
        }

        const body = await readBody(event);
        const data = historySchema.parse(body);

        // Check if exists
        const [existing] = await db
            .select()
            .from(medicalHistory)
            .where(eq(medicalHistory.patientId, patientId));

        let result;
        if (existing) {
            // Update
            [result] = await db
                .update(medicalHistory)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(medicalHistory.id, existing.id))
                .returning();
        } else {
            // Insert
            [result] = await db
                .insert(medicalHistory)
                .values({ ...data, patientId })
                .returning();
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
            statusMessage: 'Failed to save medical history',
        });
    }
});
