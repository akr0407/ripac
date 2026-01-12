import { db } from '../../db';
import { comments } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');
        if (!id) {
            throw createError({ statusCode: 400, statusMessage: 'Comment ID is required' });
        }

        const [deleted] = await db.delete(comments).where(eq(comments.id, id)).returning();

        if (!deleted) {
            throw createError({ statusCode: 404, statusMessage: 'Comment not found' });
        }

        return { success: true, data: deleted };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to delete comment' });
    }
});
