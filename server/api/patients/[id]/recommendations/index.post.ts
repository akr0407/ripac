import { db } from '../../../../db';
import { doctorRecommendations } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const recommendationSchema = z.object({
    requestRepatriation: z.boolean().optional(),
    requiresEvacuation: z.boolean().optional(),
    canBeTransported: z.boolean().optional(),
    fitToFly: z.boolean().optional(),
    needsWheelchair: z.boolean().optional(),
    notes: z.string().optional(),
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
        const data = recommendationSchema.parse(body);

        // Upsert
        const [existing] = await db
            .select()
            .from(doctorRecommendations)
            .where(eq(doctorRecommendations.patientId, patientId));

        let result;
        if (existing) {
            [result] = await db
                .update(doctorRecommendations)
                .set(data)
                .where(eq(doctorRecommendations.id, existing.id))
                .returning();
        } else {
            [result] = await db
                .insert(doctorRecommendations)
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
            statusMessage: 'Failed to save recommendations',
        });
    }
});
