import { db } from '../../../db';
import { doctors } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Import paramedic/doctor from hospital API to RIPAC database
 * 
 * POST /api/external/paramedics/import
 * 
 * Body: {
 *   paramedicCode: string,
 *   name: string
 * }
 * 
 * Action: Upsert doctor by doctorId (paramedicCode)
 */
export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Not authenticated',
        });
    }

    const orgId = session.user.currentOrganizationId;

    if (!orgId) {
        throw createError({
            statusCode: 400,
            message: 'No organization selected',
        });
    }

    // Parse request body
    const body = await readBody(event);

    const { paramedicCode, name } = body;

    // Validate required fields
    if (!paramedicCode || !name) {
        throw createError({
            statusCode: 400,
            message: 'paramedicCode and name are required',
        });
    }

    // Check if doctor already exists
    const existingDoctor = await db.query.doctors.findFirst({
        where: and(
            eq(doctors.organizationId, orgId),
            eq(doctors.doctorId, paramedicCode)
        ),
    });

    let importedDoctor;

    if (existingDoctor) {
        // Update existing doctor
        const [updated] = await db
            .update(doctors)
            .set({
                fullName: name,
                updatedAt: new Date(),
            })
            .where(eq(doctors.id, existingDoctor.id))
            .returning();

        importedDoctor = updated;
    } else {
        // Create new doctor
        const [created] = await db
            .insert(doctors)
            .values({
                organizationId: orgId,
                doctorId: paramedicCode,
                fullName: name,
            })
            .returning();

        importedDoctor = created;
    }

    return {
        success: true,
        message: existingDoctor ? 'Doctor updated' : 'Doctor imported',
        doctor: importedDoctor,
    };
});
