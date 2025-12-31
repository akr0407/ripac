import { db } from '../../../../db';
import { treatingDoctors, doctors } from '../../../../db/schema';
import { eq, asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const registrationId = getRouterParam(event, 'id');
        if (!registrationId) {
            throw createError({ statusCode: 400, statusMessage: 'Registration ID is required' });
        }

        const result = await db
            .select({
                id: treatingDoctors.id,
                doctorId: treatingDoctors.doctorId,
                doctorSequence: treatingDoctors.doctorSequence,
                assignedAt: treatingDoctors.assignedAt,
                doctorName: doctors.fullName,
            })
            .from(treatingDoctors)
            .leftJoin(doctors, eq(treatingDoctors.doctorId, doctors.id))
            .where(eq(treatingDoctors.registrationId, registrationId))
            .orderBy(asc(treatingDoctors.doctorSequence));

        return { success: true, data: result };
    } catch (error) {
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch treating doctors' });
    }
});
