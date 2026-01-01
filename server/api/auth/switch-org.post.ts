import { z } from 'zod';
import { type UserSession } from '../../utils/auth';

const switchOrgSchema = z.object({
    organizationId: z.string().uuid('Invalid organization ID'),
});

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Not authenticated',
        });
    }

    const body = await readBody(event);

    // Validate input
    const result = switchOrgSchema.safeParse(body);
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0]?.message || 'Invalid input',
        });
    }

    const { organizationId } = result.data;

    // Get user's current organizations from session
    const { getUserById } = await import('../../utils/auth');
    const user = await getUserById(session.user.id);

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'User not found',
        });
    }

    // Check if user is superadmin or has access to the organization
    const org = user.organizations.find(o => o.id === organizationId);

    if (!org && !user.isSuperadmin) {
        throw createError({
            statusCode: 403,
            message: 'You do not have access to this organization',
        });
    }

    // If superadmin switching to an org they're not a member of, get org details
    let orgSlug = org?.slug;
    if (!org && user.isSuperadmin) {
        const { db } = await import('../../db');
        const { organizations } = await import('../../db/schema');
        const { eq } = await import('drizzle-orm');

        const targetOrg = await db.query.organizations.findFirst({
            where: eq(organizations.id, organizationId),
        });

        if (!targetOrg) {
            throw createError({
                statusCode: 404,
                message: 'Organization not found',
            });
        }
        orgSlug = targetOrg.slug;
    }

    // Update session with new organization
    const updatedSession: UserSession = {
        ...session.user,
        currentOrganizationId: organizationId,
        currentOrganizationSlug: orgSlug,
    };

    await setUserSession(event, { user: updatedSession });

    return {
        message: 'Organization switched successfully',
        currentOrganizationId: organizationId,
        currentOrganizationSlug: orgSlug,
    };
});
