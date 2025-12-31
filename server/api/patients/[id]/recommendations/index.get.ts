import { db } from '../../../../db';
import { doctorRecommendations } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const patientId = getRouterParam(event, 'id');

        if (!patientId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Patient ID is required',
            });
        }

        const [rec] = await db
            .select()
            .from(doctorRecommendations)
            .where(eq(doctorRecommendations.patientId, patientId));

        return {
            success: true,
            data: rec || null,
        };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch recommendations',
        });
    }
});
