// Load environment variables for standalone script execution
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { db } from './index';
import { countries } from './schema';

async function seedCountries() {
    console.log('🌱 Starting countries seed...');

    const filePath = path.join(process.cwd(), 'docs', 'CountryList.json');
    if (!fs.existsSync(filePath)) {
        console.error('❌ CountryList.json not found at:', filePath);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const countryList = JSON.parse(fileContent);
    console.log(`📂 Found ${countryList.length} countries in JSON.`);

    const values = countryList.map((c: any) => ({
        id: c.Code, // Use Code as ID
        code: c.Code,
        name: c.Country,
        nationality: c.Nationality,
        iso: c.ISO,
    }));

    // Batch insert with onConflictDoNothing
    // Drizzle insert().values() can take array
    const result = await db.insert(countries).values(values).onConflictDoNothing().returning();

    console.log(`✅ Seeded ${result.length} new countries (some might have been skipped if existed).`);
}

seedCountries()
    .then(() => {
        console.log('🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
