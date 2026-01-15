import { db } from '../../db';
import { organizations } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Check if Hospital API is configured for current organization
 * 
 * GET /api/external/status
 * 
 * Returns: { configured: boolean, baseUrl: string | null }
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

    // Get organization settings
    const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, orgId),
    });

    if (!org) {
        throw createError({
            statusCode: 404,
            message: 'Organization not found',
        });
    }

    // Check if hospitalApi is configured
    const settings = org.settings as { hospitalApi?: { enabled: boolean; baseUrl: string } } | null;
    const hospitalApi = settings?.hospitalApi;

    // Check environment variables
    const config = useRuntimeConfig();
    const envConfigured = !!(config.hospitalApi?.username && config.hospitalApi?.password);

    return {
        configured: !!(hospitalApi?.enabled && hospitalApi?.baseUrl && envConfigured),
        isUrlConfigured: !!(hospitalApi?.enabled && hospitalApi?.baseUrl),
        isEnvConfigured: envConfigured,
        enabled: hospitalApi?.enabled ?? false,
        baseUrl: hospitalApi?.baseUrl ?? null,
        organizationName: org.name,
    };
});
