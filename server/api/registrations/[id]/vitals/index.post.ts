import { db } from '../../../../db';
import { vitalSigns } from '../../../../db/schema';
import { z } from 'zod';

// More flexible schema that accepts strings and converts to numbers
const vitalsSchema = z.object({
    pulseRate: z.union([z.number(), z.string()]).optional().nullable().transform(val => {
        if (val === '' || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
    }),
    bloodPressure: z.string().optional().nullable().transform(val => val || null),
    respiratoryRate: z.union([z.number(), z.string()]).optional().nullable().transform(val => {
        if (val === '' || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
    }),
    temperature: z.union([z.number(), z.string()]).optional().nullable().transform(val => {
        if (val === '' || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
    }),
    spo2: z.union([z.number(), z.string()]).optional().nullable().transform(val => {
        if (val === '' || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
    }),
    gcs: z.union([z.number(), z.string()]).optional().nullable().transform(val => {
        if (val === '' || val === null || val === undefined) return null;
        const num = Number(val);
        if (isNaN(num)) return null;
        if (num < 3 || num > 15) return null; // GCS must be 3-15
        return num;
    }),
});

export default defineEventHandler(async (event) => {
    try {
        const registrationId = getRouterParam(event, 'id');
        if (!registrationId) {
            throw createError({ statusCode: 400, statusMessage: 'Registration ID is required' });
        }

        const body = await readBody(event);
        const data = vitalsSchema.parse(body);

        const [result] = await db.insert(vitalSigns).values({
            registrationId,
            pulseRate: data.pulseRate?.toString() || null,
            bloodPressure: data.bloodPressure,
            respiratoryRate: data.respiratoryRate?.toString() || null,
            temperature: data.temperature?.toString() || null,
            spo2: data.spo2?.toString() || null,
            gcs: data.gcs,
            recordedAt: new Date(),
        }).returning();

        return { success: true, data: result };
    } catch (error) {
        console.error('Vitals save error:', error);
        if (error instanceof z.ZodError) {
            console.error('Zod validation errors:', error.errors);
            throw createError({ statusCode: 400, statusMessage: 'Validation failed', data: error.errors });
        }
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to save vital signs' });
    }
});
