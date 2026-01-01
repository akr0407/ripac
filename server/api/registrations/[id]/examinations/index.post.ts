import { db } from '../../../../db';
import { examinations } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Flexible schema that accepts any value and converts to string or null
const examinationSchema = z.object({
    physicalExamination: z.any().optional().transform(val => val ? String(val) : null),
    otherExamination: z.any().optional().transform(val => val ? String(val) : null),
    diagnosis: z.any().optional().transform(val => val ? String(val) : null),
    differentialDiagnosis: z.any().optional().transform(val => val ? String(val) : null),
    treatment: z.any().optional().transform(val => val ? String(val) : null),
}).passthrough(); // Allow extra fields

export default defineEventHandler(async (event) => {
    try {
        const registrationId = getRouterParam(event, 'id');
        if (!registrationId) {
            throw createError({ statusCode: 400, statusMessage: 'Registration ID is required' });
        }

        const body = await readBody(event);
        const data = examinationSchema.parse(body);

        const [existing] = await db.select().from(examinations).where(eq(examinations.registrationId, registrationId));

        let result;
        if (existing) {
            [result] = await db.update(examinations).set({
                physicalExamination: data.physicalExamination,
                otherExamination: data.otherExamination,
                diagnosis: data.diagnosis,
                differentialDiagnosis: data.differentialDiagnosis,
                treatment: data.treatment,
                updatedAt: new Date()
            }).where(eq(examinations.id, existing.id)).returning();
        } else {
            [result] = await db.insert(examinations).values({
                registrationId,
                physicalExamination: data.physicalExamination,
                otherExamination: data.otherExamination,
                diagnosis: data.diagnosis,
                differentialDiagnosis: data.differentialDiagnosis,
                treatment: data.treatment,
            }).returning();
        }

        return { success: true, data: result };
    } catch (error) {
        console.error('Examination save error:', error);
        if (error instanceof z.ZodError) {
            console.error('Zod errors:', error.errors);
            throw createError({ statusCode: 400, statusMessage: 'Validation failed', data: error.errors });
        }
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to save examination' });
    }
});
