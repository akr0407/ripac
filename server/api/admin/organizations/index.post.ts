import { z } from 'zod';
import { db } from '../../../db';
import { organizations } from '../../../db/schema';
import { logAuditAction } from '../../../utils/audit';

const createOrgSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().optional(),
    logo: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    fax: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Not authenticated',
        });
    }

    // Check if user is superadmin
    if (!session.user.isSuperadmin) {
        throw createError({
            statusCode: 403,
            message: 'Superadmin access required',
        });
    }

    const body = await readBody(event);

    // Validate input
    const result = createOrgSchema.safeParse(body);
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0]?.message || 'Invalid input',
        });
    }

    const { name, slug, description, logo, address, phone, email, fax } = result.data;

    // Build settings with hospitalApi if provided
    const settings: Record<string, unknown> = { timezone: 'Asia/Jakarta' };
    if (body.hospitalApiEnabled) {
        settings.hospitalApi = {
            enabled: body.hospitalApiEnabled,
            baseUrl: body.hospitalApiBaseUrl || '',
        };
    }

    // Check if slug is already taken
    const existingOrg = await db.query.organizations.findFirst({
        where: (orgs, { eq }) => eq(orgs.slug, slug),
    });

    if (existingOrg) {
        throw createError({
            statusCode: 409,
            message: 'Slug is already in use',
        });
    }

    // Create organization
    const [newOrg] = await db.insert(organizations).values({
        name,
        slug,
        description,
        logo,
        address,
        phone,
        email: email || null,
        fax,
        settings,
    }).returning();

    // Log audit action
    await logAuditAction(event, {
        userId: session.user.id,
        action: 'create',
        entityType: 'organization',
        entityId: newOrg.id,
        changes: { after: { name, slug, description } },
    });

    return {
        success: true,
        organization: newOrg,
        message: 'Organization created successfully',
    };
});
