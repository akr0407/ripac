import { db } from '../../../db';
import { patients, organizations } from '../../../db/schema';
import { eq, and, ilike, or } from 'drizzle-orm';
import { getHospitalClientFromOrgSettings, type PatientRegistrationItem } from '../../../utils/hospital-api';

/**
 * Smart patient search endpoint
 * 
 * Flow:
 * 1. Check local database first
 * 2. If patient exists locally, fetch hospital registrations for reference
 * 3. If patient not in local DB, search from hospital API
 * 
 * GET /api/external/patients/search?q=GUNAWAN&page=1&limit=10
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

    // Get query parameters
    const query = getQuery(event);
    const searchQuery = (query.q as string) || '';
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;

    if (!searchQuery || searchQuery.length < 2) {
        throw createError({
            statusCode: 400,
            message: 'Search query must be at least 2 characters',
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

    // Check local database first
    const localPatients = await db
        .select()
        .from(patients)
        .where(
            and(
                eq(patients.organizationId, orgId),
                or(
                    ilike(patients.fullName, `%${searchQuery}%`),
                    ilike(patients.mrNumber, `%${searchQuery}%`)
                )
            )
        )
        .limit(limit);

    // Try to get hospital registrations
    let hospitalRegistrations: PatientRegistrationItem[] = [];
    let hospitalError: string | null = null;

    const hospitalClient = getHospitalClientFromOrgSettings(org.settings || {});

    if (hospitalClient) {
        try {
            const hospitalResponse = await hospitalClient.searchPatients(searchQuery, page, limit);
            hospitalRegistrations = hospitalResponse.data;
        } catch (error) {
            hospitalError = error instanceof Error ? error.message : 'Failed to fetch from hospital API';
            console.error('Hospital API error:', hospitalError);
        }
    }

    // Build response
    const response: {
        localPatients: typeof localPatients;
        hospitalRegistrations: PatientRegistrationItem[];
        hospitalApiEnabled: boolean;
        hospitalError: string | null;
    } = {
        localPatients,
        hospitalRegistrations,
        hospitalApiEnabled: !!hospitalClient,
        hospitalError,
    };

    return response;
});
