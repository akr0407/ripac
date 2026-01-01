import { pgTable, uuid, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';
import { organizations } from './organizations';

export const membershipRoleEnum = pgEnum('membership_role', ['owner', 'admin', 'member', 'readonly']);

export const memberships = pgTable('memberships', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    role: membershipRoleEnum('role').default('member').notNull(),

    // Timestamps
    invitedAt: timestamp('invited_at'),
    joinedAt: timestamp('joined_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('memberships_user_org_idx').on(table.userId, table.organizationId),
]);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
