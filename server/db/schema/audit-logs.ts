import { pgTable, uuid, varchar, text, timestamp, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { organizations } from './organizations';

export const auditActionEnum = pgEnum('audit_action', [
    'create',
    'update',
    'delete',
    'login',
    'logout',
    'view',
    'export'
]);

export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),

    // Action details
    action: auditActionEnum('action').notNull(),
    entityType: varchar('entity_type', { length: 100 }).notNull(), // e.g., 'patient', 'doctor', 'registration'
    entityId: uuid('entity_id'),

    // Change tracking
    changes: jsonb('changes').$type<{
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
        fields?: string[];
    }>(),

    // Request context
    ipAddress: varchar('ip_address', { length: 45 }), // Supports IPv6
    userAgent: text('user_agent'),

    // Timestamp
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('audit_logs_user_idx').on(table.userId),
    index('audit_logs_org_idx').on(table.organizationId),
    index('audit_logs_entity_idx').on(table.entityType, table.entityId),
    index('audit_logs_created_at_idx').on(table.createdAt),
]);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
