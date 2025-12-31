import { db } from '../../../../db';
import { examinations } from '../../../../db/schema';
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

        const [exam] = await db
            .select()
            .from(examinations)
            .where(eq(examinations.patientId, patientId));

        return {
            success: true,
            data: exam || null,
        };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch examination',
        });
    }
});
