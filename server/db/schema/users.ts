import { pgTable, uuid, varchar, text, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    passwordHash: text('password_hash'), // Nullable for SSO-only users
    
    // SSO fields
    ssoProviderId: varchar('sso_provider_id', { length: 100 }), // e.g., 'company-oidc'
    ssoSubject: varchar('sso_subject', { length: 255 }), // The 'sub' claim from OIDC
    
    // Admin flag
    isSuperadmin: boolean('is_superadmin').default(false).notNull(),
    
    // Status and timestamps
    isActive: boolean('is_active').default(true).notNull(),
    emailVerifiedAt: timestamp('email_verified_at'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('users_sso_idx').on(table.ssoProviderId, table.ssoSubject),
]);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
