import { db } from '../../../../db';
import { vitalSigns } from '../../../../db/schema';
import { z } from 'zod';

const vitalsSchema = z.object({
    pulseRate: z.number().optional().nullable(),
    bloodPressure: z.string().optional().nullable(),
    respiratoryRate: z.number().optional().nullable(),
    temperature: z.number().optional().nullable(),
    spo2: z.number().optional().nullable(),
    gcs: z.number().min(3).max(15).optional().nullable(),
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
        const data = vitalsSchema.parse(body);

        const [result] = await db
            .insert(vitalSigns)
            .values({
                ...data,
                patientId,
                recordedAt: new Date(),
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
            statusMessage: 'Failed to save vital signs',
        });
    }
});
