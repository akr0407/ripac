import { eq } from 'drizzle-orm';
import { organizations } from '../../../db/schema/organizations';
import { db } from '../../../db';

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);
    const id = getRouterParam(event, 'id');
    if (!session.user.isSuperadmin) {
        throw createError({ statusCode: 403, message: 'Superadmin access required' });
    }

    const body = await readBody(event);

    // Validate input (basic)
    if (!body.name || !body.slug) {
        throw createError({ statusCode: 400, message: 'Name and slug are required' });
    }

    try {
        const updated = await db.update(organizations)
            .set({
                name: body.name,
                slug: body.slug, // Warning: changing slug might break URLs
                description: body.description,
                isActive: body.isActive,
                logo: body.logo,
                address: body.address,
                phone: body.phone,
                email: body.email || null,
                fax: body.fax,
                updatedAt: new Date()
            })
            .where(eq(organizations.id, id as string))
            .returning();

        return updated[0];
    } catch (e: any) {
        if (e.code === '23505') { // Unique violation for slug
            throw createError({ statusCode: 400, message: 'Slug already exists' });
        }
        throw e;
    }
});
