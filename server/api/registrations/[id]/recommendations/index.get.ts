import { db } from '../../../../db';
import { doctorRecommendations } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const registrationId = getRouterParam(event, 'id');
        if (!registrationId) {
            throw createError({ statusCode: 400, statusMessage: 'Registration ID is required' });
        }

        const [rec] = await db.select().from(doctorRecommendations).where(eq(doctorRecommendations.registrationId, registrationId));

        return { success: true, data: rec || null };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch recommendations' });
    }
});
