import { db } from '../../../../db';
import { examinations } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const registrationId = getRouterParam(event, 'id');
        if (!registrationId) {
            throw createError({ statusCode: 400, statusMessage: 'Registration ID is required' });
        }

        const [exam] = await db.select().from(examinations).where(eq(examinations.registrationId, registrationId));

        return { success: true, data: exam || null };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch examination' });
    }
});
