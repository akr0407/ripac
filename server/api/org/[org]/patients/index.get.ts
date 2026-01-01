import { db } from '../../../../db';
import { patients } from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { getOrganizationContext } from '../../../../utils/organization';

export default defineEventHandler(async (event) => {
    const orgContext = await getOrganizationContext(event);

    try {
        const allPatients = await db
            .select()
            .from(patients)
            .where(eq(patients.organizationId, orgContext.organizationId))
            .orderBy(desc(patients.createdAt));

        return {
            success: true,
            data: allPatients,
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch patients',
        });
    }
});
