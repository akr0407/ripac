import { db } from '../../../../db';
import { comments } from '../../../../db/schema';
import { z } from 'zod';

const commentSchema = z.object({
    commentText: z.string().min(1, 'Comment text is required'),
});

export default defineEventHandler(async (event) => {
    try {
        const patientId = getRouterParam(event, 'id');

        if (!patientId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Patient ID is required',
            });
        }

        const body = await readBody(event);
        const { commentText } = commentSchema.parse(body);

        const [result] = await db
            .insert(comments)
            .values({
                patientId,
                commentText,
            })
            .returning();

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Validation failed',
            });
        }
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to save comment',
        });
    }
});
