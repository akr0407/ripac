import { db } from '../../../../db';
import { medicalHistory } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Flexible schema that accepts any value and converts to string or null
const historySchema = z.object({
    presentComplaint: z.any().optional().transform(val => val ? String(val) : null),
    pastMedicalHistory: z.any().optional().transform(val => val ? String(val) : null),
    allergicHistory: z.any().optional().transform(val => val ? String(val) : null),
    currentMedication: z.any().optional().transform(val => val ? String(val) : null),
}).passthrough();

export default defineEventHandler(async (event) => {
    try {
        const registrationId = getRouterParam(event, 'id');
        if (!registrationId) {
            throw createError({ statusCode: 400, statusMessage: 'Registration ID is required' });
        }

        const body = await readBody(event);
        const data = historySchema.parse(body);

        const [existing] = await db.select().from(medicalHistory).where(eq(medicalHistory.registrationId, registrationId));

        let result;
        if (existing) {
            [result] = await db.update(medicalHistory).set({
                presentComplaint: data.presentComplaint,
                pastMedicalHistory: data.pastMedicalHistory,
                allergicHistory: data.allergicHistory,
                currentMedication: data.currentMedication,
                updatedAt: new Date()
            }).where(eq(medicalHistory.id, existing.id)).returning();
        } else {
            [result] = await db.insert(medicalHistory).values({
                registrationId,
                presentComplaint: data.presentComplaint,
                pastMedicalHistory: data.pastMedicalHistory,
                allergicHistory: data.allergicHistory,
                currentMedication: data.currentMedication,
            }).returning();
        }

        return { success: true, data: result };
    } catch (error) {
        console.error('Medical history save error:', error);
        if (error instanceof z.ZodError) {
            console.error('Zod errors:', error.errors);
            throw createError({ statusCode: 400, statusMessage: 'Validation failed', data: error.errors });
        }
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to save medical history' });
    }
});
