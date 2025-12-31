import { db } from '../../../../db';
import { examinations } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const examinationSchema = z.object({
    physicalExamination: z.string().optional(),
    otherExamination: z.string().optional(),
    diagnosis: z.string().optional(),
    differentialDiagnosis: z.string().optional(),
    treatment: z.string().optional(),
});

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
            [result] = await db.update(examinations).set({ ...data, updatedAt: new Date() }).where(eq(examinations.id, existing.id)).returning();
        } else {
            [result] = await db.insert(examinations).values({ ...data, registrationId }).returning();
        }

        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) throw createError({ statusCode: 400, statusMessage: 'Validation failed' });
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to save examination' });
    }
});
