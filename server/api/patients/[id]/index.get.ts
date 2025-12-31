import { db } from '../../../db';
import { patients } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Patient ID is required',
            });
        }

        const [patient] = await db
            .select()
            .from(patients)
            .where(eq(patients.id, id));

        if (!patient) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Patient not found',
            });
        }

        return {
            success: true,
            data: patient,
        };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch patient',
        });
    }
});
