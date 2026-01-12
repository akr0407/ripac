
import 'dotenv/config';
import { db } from './server/db';
import { users } from './server/db/schema';
import { eq } from 'drizzle-orm';

async function hashPasswordLocal(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
    console.log('Checking users in database...');
    const adminUser = await db.query.users.findFirst({
        where: eq(users.email, 'admin@ripac.local')
    });

    if (adminUser) {
        console.log(`User: ${adminUser.email}`);
        console.log(`Stored Hash: ${adminUser.passwordHash}`);

        const expectedHash = await hashPasswordLocal('admin123');
        console.log(`Expected Hash for 'admin123': ${expectedHash}`);

        if (adminUser.passwordHash === expectedHash) {
            console.log('✅ Hash MATCHES!');
        } else {
            console.log('❌ Hash DOES NOT match!');
        }
    } else {
        console.log('Admin user not found');
    }
}

main().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});
