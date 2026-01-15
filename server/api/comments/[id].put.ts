import { db } from '../../db';
import { comments } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateCommentSchema = z.object({
    commentText: z.string().min(1, 'Comment text is required'),
});

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');
        if (!id) {
            throw createError({ statusCode: 400, statusMessage: 'Comment ID is required' });
        }

        const body = await readBody(event);
        const { commentText } = updateCommentSchema.parse(body);

        const [updated] = await db.update(comments)
            .set({ commentText })
            .where(eq(comments.id, id))
            .returning();

        if (!updated) {
            throw createError({ statusCode: 404, statusMessage: 'Comment not found' });
        }

        return { success: true, data: updated };
    } catch (error) {
        if (error instanceof z.ZodError) throw createError({ statusCode: 400, statusMessage: 'Validation failed' });
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to update comment' });
    }
});
