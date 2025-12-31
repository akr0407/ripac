import { db } from '../../../../db';
import { vitalSigns } from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const patientId = getRouterParam(event, 'id');

        if (!patientId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Patient ID is required',
            });
        }

        const vitals = await db
            .select()
            .from(vitalSigns)
            .where(eq(vitalSigns.patientId, patientId))
            .orderBy(desc(vitalSigns.recordedAt));

        return {
            success: true,
            data: vitals,
        };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch vital signs',
        });
    }
});
