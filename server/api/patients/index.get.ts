import { db } from '../../db';
import { patients } from '../../db/schema';
import { desc } from 'drizzle-orm';

export default defineEventHandler(async () => {
    try {
        const allPatients = await db
            .select()
            .from(patients)
            .orderBy(desc(patients.createdAt));

        return {
            success: true,
            data: allPatients,
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch patients',
        });
    }
});
