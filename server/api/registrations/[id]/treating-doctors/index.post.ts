import { db } from '../../../../db';
import { treatingDoctors } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Flexible schema for treating doctors
const treatingDoctorsSchema = z.object({
    doctors: z.array(z.object({
        doctorId: z.any().optional().transform(val => {
            if (!val) return null;
            if (typeof val === 'string') return val;
            if (typeof val === 'object' && val.id) return String(val.id);
            if (typeof val === 'object' && val.value) return String(val.value);
            return String(val); // Fallback but likely [object Object]
        }),
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
        // Debug logging
        try {
            const fs = await import('fs');
            const path = await import('path');
            const logPath = path.resolve(process.cwd(), 'server-debug.log');
            const logMessage = `
[${new Date().toISOString()}] Treating Doctors Save Failed:
Registration ID: ${getRouterParam(event, 'id')}
Error: ${error instanceof Error ? error.message : JSON.stringify(error)}
Stack: ${error instanceof Error ? error.stack : ''}
Validation Errors: ${error instanceof z.ZodError ? JSON.stringify(error.errors) : 'None'}
----------------------------------------
`;
            fs.appendFileSync(logPath, logMessage);
        } catch (e) {
            console.error('Failed to write debug log', e);
        }

        console.error('Treating doctors save error:', error);
        if (error instanceof z.ZodError) {
            console.error('Zod errors:', error.errors);
            throw createError({ statusCode: 400, statusMessage: 'Validation failed', data: error.errors });
        }
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: 'Failed to save treating doctors' });
    }
});
