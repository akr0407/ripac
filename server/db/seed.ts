// Load environment variables for standalone script execution
import 'dotenv/config';

import { db } from './index';
import { users, organizations, memberships } from './schema';
import { eq } from 'drizzle-orm';

// Simple password hashing without bcrypt for initial seed
// In production, the auth endpoints will use proper bcrypt hashing
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function seed() {
    console.log('🌱 Starting database seed...');

    try {
        // --- Create Organizations ---
        console.log('📁 Creating organizations...');

        const [rsiaOrg] = await db.insert(organizations).values({
            name: 'RSIA',
            slug: 'rsia',
            description: 'RSIA Hospital',
            settings: {
                timezone: 'Asia/Makassar',
                hospitalApi: {
                    enabled: true,
                    baseUrl: 'http://10.10.10.99:3020/api',
                },
            },
        }).onConflictDoNothing().returning();

        const [brosOrg] = await db.insert(organizations).values({
            name: 'BROS',
            slug: 'bros',
            description: 'BROS Medical Center',
            address: 'Jl. Letda Tantular No. 6 Denpasar, Bali',
            phone: '+ 62 361 247 499, +62 361 222 588(Hunting)',
            fax: '+62 361 22605',
            email: 'info@baliroyalhospital.co.id',
            settings: {
                timezone: 'Asia/Makassar',
                hospitalApi: {
                    enabled: true,
                    baseUrl: 'http://10.100.10.100:3020/api',
                },
            },
        }).onConflictDoUpdate({
            target: organizations.slug,
            set: {
                address: 'Jl. Letda Tantular No. 6 Denpasar, Bali',
                phone: '+ 62 361 247 499, +62 361 222 588(Hunting)',
                fax: '+62 361 22605',
                email: 'info@baliroyalhospital.co.id',
                settings: {
                    timezone: 'Asia/Makassar',
                    hospitalApi: {
                        enabled: true,
                        baseUrl: 'http://10.100.10.100:3020/api',
                    },
                },
            }
        }).returning();

        console.log('✅ Organizations created:', rsiaOrg?.slug || 'rsia (exists)', brosOrg?.slug || 'bros (exists)');

        // Get org IDs if they already exist
        const orgs = await db.select().from(organizations).where(
            eq(organizations.slug, 'rsia')
        );
        const rsiaId = rsiaOrg?.id || orgs[0]?.id;

        const brosOrgs = await db.select().from(organizations).where(
            eq(organizations.slug, 'bros')
        );
        const brosId = brosOrg?.id || brosOrgs[0]?.id;

        if (!rsiaId || !brosId) {
            throw new Error('Failed to get organization IDs');
        }

        // --- Create Superadmin User ---
        console.log('👤 Creating superadmin user...');

        const passwordHash = await hashPassword('admin123');

        const [superadmin] = await db.insert(users).values({
            email: 'admin@ripac.local',
            name: 'Super Admin',
            passwordHash,
            isSuperadmin: true,
            emailVerifiedAt: new Date(),
        }).onConflictDoNothing().returning();

        console.log('✅ Superadmin created:', superadmin?.email || 'admin@ripac.local (exists)');

        // Get user ID if already exists
        const existingUsers = await db.select().from(users).where(
            eq(users.email, 'admin@ripac.local')
        );
        const adminId = superadmin?.id || existingUsers[0]?.id;

        if (!adminId) {
            throw new Error('Failed to get superadmin user ID');
        }

        // --- Create Memberships ---
        console.log('🔗 Creating memberships...');

        await db.insert(memberships).values({
            userId: adminId,
            organizationId: rsiaId,
            role: 'owner',
            joinedAt: new Date(),
        }).onConflictDoNothing();

        await db.insert(memberships).values({
            userId: adminId,
            organizationId: brosId,
            role: 'owner',
            joinedAt: new Date(),
        }).onConflictDoNothing();

        console.log('✅ Memberships created for superadmin in RSIA and BROS');

        // --- Create Sample Users for RSIA ---
        console.log('👥 Creating sample users for RSIA...');

        const rsiaUsers = [
            { email: 'rsia@ripac.local', name: 'RSIA Owner', role: 'owner' as const },
            { email: 'dokter.ani@rsia.local', name: 'Dr. Ani Wijaya', role: 'admin' as const },
            { email: 'dokter.budi@rsia.local', name: 'Dr. Budi Santoso', role: 'member' as const },
            { email: 'nurse.citra@rsia.local', name: 'Citra Dewi', role: 'member' as const },
        ];

        for (const userData of rsiaUsers) {
            const userHash = await hashPassword('password123');
            const [newUser] = await db.insert(users).values({
                email: userData.email,
                name: userData.name,
                passwordHash: userHash,
                emailVerifiedAt: new Date(),
            }).onConflictDoNothing().returning();

            if (newUser) {
                await db.insert(memberships).values({
                    userId: newUser.id,
                    organizationId: rsiaId,
                    role: userData.role,
                    joinedAt: new Date(),
                }).onConflictDoNothing();
            }
        }
        console.log('✅ RSIA users created: 3 users');

        // --- Create Sample Users for BROS ---
        console.log('👥 Creating sample users for BROS...');

        const brosUsers = [
            { email: 'bros@ripac.local', name: 'BROS Owner', role: 'owner' as const },
            { email: 'dokter.dian@bros.local', name: 'Dr. Dian Pratama', role: 'admin' as const },
            { email: 'dokter.eko@bros.local', name: 'Dr. Eko Susanto', role: 'member' as const },
            { email: 'admin.fira@bros.local', name: 'Fira Hastuti', role: 'member' as const },
        ];

        for (const userData of brosUsers) {
            const userHash = await hashPassword('password123');
            const [newUser] = await db.insert(users).values({
                email: userData.email,
                name: userData.name,
                passwordHash: userHash,
                emailVerifiedAt: new Date(),
            }).onConflictDoNothing().returning();

            if (newUser) {
                await db.insert(memberships).values({
                    userId: newUser.id,
                    organizationId: brosId,
                    role: userData.role,
                    joinedAt: new Date(),
                }).onConflictDoNothing();
            }
        }
        console.log('✅ BROS users created: 3 users');

        console.log('\n🎉 Database seeding completed!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Superadmin credentials:');
        console.log('  Email: admin@ripac.local');
        console.log('  Password: admin123');
        console.log('');
        console.log('Sample users (password: password123):');
        console.log('  RSIA: rsia@ripac.local, dokter.ani@rsia.local, dokter.budi@rsia.local, nurse.citra@rsia.local');
        console.log('  BROS: bros@ripac.local, dokter.dian@bros.local, dokter.eko@bros.local, admin.fira@bros.local');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

// Run the seed
seed()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
