import { db } from '../../../../db';
import { doctors } from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { getOrganizationContext } from '../../../../utils/organization';

export default defineEventHandler(async (event) => {
    const orgContext = await getOrganizationContext(event);

    try {
        const allDoctors = await db
            .select()
            .from(doctors)
            .where(eq(doctors.organizationId, orgContext.organizationId))
            .orderBy(desc(doctors.createdAt));

        return {
            success: true,
            data: allDoctors,
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch doctors',
        });
    }
});
