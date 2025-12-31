import { db } from '../../../../db';
import { vitalSigns } from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const registrationId = getRouterParam(event, 'id');
        if (!registrationId) {
            throw createError({ statusCode: 400, statusMessage: 'Registration ID is required' });
        }

        const vitals = await db.select().from(vitalSigns).where(eq(vitalSigns.registrationId, registrationId)).orderBy(desc(vitalSigns.recordedAt));

        return { success: true, data: vitals };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch vital signs' });
    }
});
