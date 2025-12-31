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

        const [doctor] = await db
            .select()
            .from(doctors)
            .where(eq(doctors.id, id));

        if (!doctor) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Doctor not found',
            });
        }

        return {
            success: true,
            data: doctor,
        };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch doctor',
        });
    }
});
