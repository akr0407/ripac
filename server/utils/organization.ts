import { H3Event } from 'h3';
import { db } from '../db';
import { organizations, memberships } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface OrganizationContext {
    organizationId: string;
    organizationSlug: string;
    organizationName: string;
    userRole: string;
}

/**
 * Get organization context from the request
 * Checks if the user has access to the requested organization
 */
export async function getOrganizationContext(event: H3Event): Promise<OrganizationContext> {
    const session = await getUserSession(event);

    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Not authenticated',
        });
    }

    // Get organization slug from route params or query
    const params = event.context.params || {};
    const orgSlug = params.org as string;

    if (!orgSlug) {
        throw createError({
            statusCode: 400,
            message: 'Organization context required',
        });
    }

    // Find organization
    const org = await db.query.organizations.findFirst({
        where: eq(organizations.slug, orgSlug),
    });

    if (!org) {
        throw createError({
            statusCode: 404,
            message: 'Organization not found',
        });
    }

    // Check if organization is active
    if (!org.isActive) {
        throw createError({
            statusCode: 403,
            message: 'Organization is not active',
        });
    }

    // Superadmins have access to all organizations
    if (session.user.isSuperadmin) {
        return {
            organizationId: org.id,
            organizationSlug: org.slug,
            organizationName: org.name,
            userRole: 'superadmin',
        };
    }

    // Check user membership
    const membership = await db.query.memberships.findFirst({
        where: and(
            eq(memberships.userId, session.user.id),
            eq(memberships.organizationId, org.id)
        ),
    });

    if (!membership) {
        throw createError({
            statusCode: 403,
            message: 'You do not have access to this organization',
        });
    }

    return {
        organizationId: org.id,
        organizationSlug: org.slug,
        organizationName: org.name,
        userRole: membership.role,
    };
}

/**
 * Require specific role(s) in the organization
 */
export function requireRole(context: OrganizationContext, roles: string | string[]): void {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Superadmins can always access
    if (context.userRole === 'superadmin') {
        return;
    }

    if (!allowedRoles.includes(context.userRole)) {
        throw createError({
            statusCode: 403,
            message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        });
    }
}
