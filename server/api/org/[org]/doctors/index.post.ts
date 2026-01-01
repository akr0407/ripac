import { db } from '../../../../db';
import { doctors } from '../../../../db/schema';
import { z } from 'zod';
import { getOrganizationContext } from '../../../../utils/organization';
import { logAuditAction } from '../../../../utils/audit';

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
    const orgContext = await getOrganizationContext(event);
    const session = await getUserSession(event);

    try {
        const body = await readBody(event);
        const validatedData = createDoctorSchema.parse(body);

        const [newDoctor] = await db
            .insert(doctors)
            .values({
                organizationId: orgContext.organizationId,
                ...validatedData,
            })
            .returning();

        // Log audit action
        await logAuditAction(event, {
            userId: session?.user?.id,
            organizationId: orgContext.organizationId,
            action: 'create',
            entityType: 'doctor',
            entityId: newDoctor.id,
            changes: { after: validatedData },
        });

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
        console.error('Failed to create doctor:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create doctor',
        });
    }
});
