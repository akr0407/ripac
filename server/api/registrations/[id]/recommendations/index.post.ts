import { db } from '../../../../db';
import { doctorRecommendations } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Helper to convert any value to boolean
const toBool = (val: any) => {
    if (val === true || val === 'true' || val === 1 || val === '1') return true;
    if (val === false || val === 'false' || val === 0 || val === '0') return false;
    return null;
};

// Flexible schema that accepts various inputs
const recommendationSchema = z.object({
    requestRepatriation: z.any().optional().transform(toBool),
    requiresEvacuation: z.any().optional().transform(toBool),
    canBeTransported: z.any().optional().transform(toBool),
    fitToFly: z.any().optional().transform(toBool),
    needsWheelchair: z.any().optional().transform(toBool),
    notes: z.any().optional().transform(val => val ? String(val) : null),
}).passthrough();

export default defineEventHandler(async (event) => {
    try {
        const registrationId = getRouterParam(event, 'id');
        if (!registrationId) {
            throw createError({ statusCode: 400, statusMessage: 'Registration ID is required' });
        }

        const body = await readBody(event);
        const data = recommendationSchema.parse(body);

        const [existing] = await db.select().from(doctorRecommendations).where(eq(doctorRecommendations.registrationId, registrationId));

        let result;
        if (existing) {
            [result] = await db.update(doctorRecommendations).set({
                requestRepatriation: data.requestRepatriation,
                requiresEvacuation: data.requiresEvacuation,
                canBeTransported: data.canBeTransported,
                fitToFly: data.fitToFly,
                needsWheelchair: data.needsWheelchair,
                notes: data.notes,
                updatedAt: new Date(),
            }).where(eq(doctorRecommendations.id, existing.id)).returning();
        } else {
            [result] = await db.insert(doctorRecommendations).values({
                registrationId,
                requestRepatriation: data.requestRepatriation,
                requiresEvacuation: data.requiresEvacuation,
                canBeTransported: data.canBeTransported,
                fitToFly: data.fitToFly,
                needsWheelchair: data.needsWheelchair,
                notes: data.notes,
            }).returning();
        }

        return { success: true, data: result };
    } catch (error) {
        console.error('Recommendations save error:', error);
        if (error instanceof z.ZodError) {
            console.error('Zod errors:', error.errors);
            throw createError({ statusCode: 400, statusMessage: 'Validation failed', data: error.errors });
        }
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to save recommendations' });
    }
});
