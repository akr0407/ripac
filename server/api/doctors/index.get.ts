import { db } from '../../db';
import { doctors } from '../../db/schema';
import { desc } from 'drizzle-orm';

export default defineEventHandler(async () => {
    try {
        const allDoctors = await db
            .select()
            .from(doctors)
            .orderBy(desc(doctors.createdAt));

        return {
            success: true,
            data: allDoctors,
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch doctors',
        });
    }
});
