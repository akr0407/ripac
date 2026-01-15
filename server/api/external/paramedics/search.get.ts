import { db } from '../../../db';
import { organizations, doctors } from '../../../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getHospitalClientFromOrgSettings, type ParamedicItem } from '../../../utils/hospital-api';

/**
 * Search paramedics/doctors from hospital API
 * 
 * GET /api/external/paramedics/search?page=1&limit=10
 * 
 * Returns paginated list of paramedics from external hospital API
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
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;

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

    // Get hospital client
    const hospitalClient = getHospitalClientFromOrgSettings(org.settings || {});

    if (!hospitalClient) {
        throw createError({
            statusCode: 400,
            message: 'Hospital API not configured for this organization',
        });
    }

    const search = (query.q as string) || '';

    try {
        const response = await hospitalClient.getParamedicList(page, limit, search);

        // Filter out empty names
        if (response.data) {
            response.data = response.data.filter(d => d.Name && d.Name.trim().length > 0 && d.Name.trim() !== '-');
        }

        // Get list of existing paramedic codes (doctor IDs) from our DB
        // We optimize by querying only the IDs present in the response page
        const hospitalCodes = response.data.map(d => d.ParamedicCode);

        const existingDoctors = await db
            .select({
                doctorId: doctors.doctorId,
                fullName: doctors.fullName
            })
            .from(doctors)
            .where(and(
                eq(doctors.organizationId, orgId),
                inArray(doctors.doctorId, hospitalCodes.length > 0 ? hospitalCodes : ['___dummy___'])
            ));

        // Map for quick lookup
        const existingMap = new Map(existingDoctors.map(d => [d.doctorId, d]));

        // Add flags
        const enrichedData = response.data.map(d => {
            const local = existingMap.get(d.ParamedicCode);
            const isImported = !!local;
            const isDifferent = isImported && local?.fullName !== d.Name;

            return {
                ...d,
                isImported,
                isDifferent,
                localData: local ? { fullName: local.fullName } : null
            };
        });

        return {
            success: true,
            data: enrichedData,
            total: response.total,
            page: response.page,
            limit: response.limit,
            totalPages: response.totalPages,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch paramedics';
        console.error('Hospital API error:', errorMessage);

        throw createError({
            statusCode: 502,
            message: `Hospital API error: ${errorMessage}`,
        });
    }
});
