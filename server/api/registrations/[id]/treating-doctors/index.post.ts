import { db } from '../../../../db';
import { treatingDoctors } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Flexible schema for treating doctors
const treatingDoctorsSchema = z.object({
    doctors: z.array(z.object({
        doctorId: z.any().optional().transform(val => val ? String(val) : null),
        sequence: z.any().optional().transform(val => {
            const num = Number(val);
            return isNaN(num) ? 1 : Math.max(1, Math.min(4, num));
        }),
        isMain: z.boolean().optional().default(false),
    })).optional().default([]),
}).passthrough();

export default defineEventHandler(async (event) => {
    try {
        const registrationId = getRouterParam(event, 'id');
        if (!registrationId) {
            throw createError({ statusCode: 400, statusMessage: 'Registration ID is required' });
        }

        const body = await readBody(event);
        const { doctors: doctorList } = treatingDoctorsSchema.parse(body);

        await db.delete(treatingDoctors).where(eq(treatingDoctors.registrationId, registrationId));

        const toInsert = (doctorList || [])
            .filter(d => d.doctorId)
            .map(d => ({
                registrationId,
                doctorId: d.doctorId!,
                doctorSequence: d.sequence,
                isMain: d.isMain,
                assignedAt: new Date(),
            }));

        if (toInsert.length > 0) {
            await db.insert(treatingDoctors).values(toInsert);
        }

        return { success: true, message: 'Treating doctors updated' };
    } catch (error) {
        console.error('Treating doctors save error:', error);
        if (error instanceof z.ZodError) {
            console.error('Zod errors:', error.errors);
            throw createError({ statusCode: 400, statusMessage: 'Validation failed', data: error.errors });
        }
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to save treating doctors' });
    }
});
