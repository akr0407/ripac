import { db } from '../../db';
import { countries } from '../../db/schema';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const data = await db.select().from(countries).orderBy(asc(countries.nationality));
    return { data };
});
