import { db } from '../../../../db';
import { medicalHistory } from '../../../../db/schema';
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

        const [history] = await db
            .select()
            .from(medicalHistory)
            .where(eq(medicalHistory.patientId, patientId));

        return {
            success: true,
            data: history || null,
        };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch medical history',
        });
    }
});
