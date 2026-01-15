import { db } from '../../db';
import { countries } from '../../db/schema';
import { readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        console.log('API /countries POST received');
        const body = await readBody(event);
        console.log('Body:', body);

        if (!body.nationality) {
            throw createError({ statusCode: 400, message: 'Nationality is required' });
        }

        const id = body.code || `MANUAL-${Date.now()}`;
        console.log('Generated ID:', id);

        const [newCountry] = await db.insert(countries).values({
            id: id,
            code: body.code || id,
            name: body.name || body.nationality,
            nationality: body.nationality,
            iso: body.iso,
        }).returning();

        console.log('Insert success:', newCountry);
        return { data: newCountry };
    } catch (e: any) {
        console.error('API /countries POST Error:', e);
        throw createError({
            statusCode: 500,
            message: e.message || 'Internal Server Error',
        });
    }
});
