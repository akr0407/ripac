import { db } from '../../../../db';
import { treatingDoctors } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const treatingDoctorsSchema = z.object({
    doctors: z.array(z.object({
        doctorId: z.string().nullable(),
        sequence: z.number().min(1).max(4),
    })),
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
        const { doctors: doctorList } = treatingDoctorsSchema.parse(body);

        // Delete existing assignments
        await db
            .delete(treatingDoctors)
            .where(eq(treatingDoctors.patientId, patientId));

        // Insert new assignments
        const toInsert = doctorList
            .filter(d => d.doctorId)
            .map(d => ({
                patientId,
                doctorId: d.doctorId!,
                doctorSequence: d.sequence,
                assignedAt: new Date(),
            }));

        if (toInsert.length > 0) {
            await db.insert(treatingDoctors).values(toInsert);
        }

        return {
            success: true,
            message: 'Treating doctors updated',
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
            statusMessage: 'Failed to save treating doctors',
        });
    }
});
