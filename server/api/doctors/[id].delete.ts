import { db } from '../../db';
import { doctors } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Doctor ID is required',
            });
        }

        // Soft delete - set isActive to false
        const [deletedDoctor] = await db
            .update(doctors)
            .set({
                isActive: false,
                updatedAt: new Date(),
            })
            .where(eq(doctors.id, id))
            .returning();

        if (!deletedDoctor) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Doctor not found',
            });
        }

        return {
            success: true,
            message: 'Doctor deleted successfully',
        };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete doctor',
        });
    }
});
