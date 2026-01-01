import { db } from '../db';
import { users, memberships, organizations } from '../db/schema';
import { eq } from 'drizzle-orm';

// Simple password hashing using SHA-256 (same as seeder)
// Note: In production, you should use bcrypt, but this avoids native module issues
export async function hashPasswordLocal(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPasswordLocal(password: string, hash: string): Promise<boolean> {
    const passwordHash = await hashPasswordLocal(password);
    return passwordHash === hash;
}

export interface UserSession {
    id: string;
    email: string;
    name: string;
    isSuperadmin: boolean;
    currentOrganizationId?: string;
    currentOrganizationSlug?: string;
}

export interface UserWithOrganizations extends UserSession {
    organizations: Array<{
        id: string;
        name: string;
        slug: string;
        role: string;
    }>;
}

/**
 * Get user by email with their organization memberships
 */
export async function getUserByEmail(email: string): Promise<UserWithOrganizations | null> {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) return null;

    const userMemberships = await db
        .select({
            id: organizations.id,
            name: organizations.name,
            slug: organizations.slug,
            role: memberships.role,
        })
        .from(memberships)
        .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
        .where(eq(memberships.userId, user.id));

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperadmin: user.isSuperadmin,
        organizations: userMemberships,
    };
}

/**
 * Get user by ID with their organization memberships
 */
export async function getUserById(id: string): Promise<UserWithOrganizations | null> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, id),
    });

    if (!user) return null;

    const userMemberships = await db
        .select({
            id: organizations.id,
            name: organizations.name,
            slug: organizations.slug,
            role: memberships.role,
        })
        .from(memberships)
        .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
        .where(eq(memberships.userId, user.id));

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperadmin: user.isSuperadmin,
        organizations: userMemberships,
    };
}

/**
 * Find or create user from SSO claims
 */
export async function findOrCreateSsoUser(
    ssoProviderId: string,
    ssoSubject: string,
    email: string,
    name: string
): Promise<UserWithOrganizations> {
    // Try to find existing user by SSO subject
    let user = await db.query.users.findFirst({
        where: eq(users.ssoSubject, ssoSubject),
    });

    // If not found by SSO, try by email
    if (!user) {
        user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        // If found by email, link SSO
        if (user) {
            await db.update(users)
                .set({ ssoProviderId, ssoSubject })
                .where(eq(users.id, user.id));
        }
    }

    // If still not found, create new user
    if (!user) {
        const [newUser] = await db.insert(users).values({
            email,
            name,
            ssoProviderId,
            ssoSubject,
            emailVerifiedAt: new Date(),
        }).returning();
        user = newUser;
    }

    // Update last login
    await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

    // Get user with memberships
    return getUserById(user.id) as Promise<UserWithOrganizations>;
}
