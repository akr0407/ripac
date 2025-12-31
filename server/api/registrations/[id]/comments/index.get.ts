import { db } from '../../../../db';
import { comments } from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const registrationId = getRouterParam(event, 'id');
        if (!registrationId) {
            throw createError({ statusCode: 400, statusMessage: 'Registration ID is required' });
        }

        const result = await db.select().from(comments).where(eq(comments.registrationId, registrationId)).orderBy(desc(comments.createdAt));

        return { success: true, data: result };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch comments' });
    }
});
