import { db } from '../../db';
import { doctors } from '../../db/schema';
import { z } from 'zod';

const createDoctorSchema = z.object({
    doctorId: z.string().min(1, 'Doctor ID is required'),
    nickName: z.string().optional(),
    fullName: z.string().min(1, 'Full name is required'),
    address: z.string().optional(),
    phone1: z.string().optional(),
    phone2: z.string().optional(),
    isActive: z.boolean().default(true),
});

export default defineEventHandler(async (event) => {
    try {
        // Get the user session and organization
        const session = await requireUserSession(event);
        const organizationId = session.user.currentOrganizationId;

        if (!organizationId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No organization selected',
            });
        }

        const body = await readBody(event);
        const validatedData = createDoctorSchema.parse(body);

        const [newDoctor] = await db
            .insert(doctors)
            .values({
                ...validatedData,
                organizationId,
            })
            .returning();

        return {
            success: true,
            data: newDoctor,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Validation failed',
                data: error.errors,
            });
        }
        // Re-throw if it's already a createError
        if ((error as any).statusCode) {
            throw error;
        }
        console.error('Doctor creation error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create doctor',
        });
    }
});
