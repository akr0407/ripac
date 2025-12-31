import { db } from '../../../../db';
import { registrations } from '../../../../db/schema';
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

        const result = await db
            .select()
            .from(registrations)
            .where(eq(registrations.patientId, patientId))
            .orderBy(desc(registrations.createdAt));

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch registrations',
        });
    }
});
