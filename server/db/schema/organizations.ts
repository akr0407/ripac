import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const organizations = pgTable('organizations', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(), // URL-friendly identifier
    description: text('description'),
    logo: varchar('logo', { length: 255 }), // URL to organization logo
    address: text('address'), // Physical address

    // Organization settings (JSON for flexibility)
    settings: jsonb('settings').$type<{
        theme?: string;
        timezone?: string;
        dateFormat?: string;
        [key: string]: unknown;
    }>().default({}),

    // Status
    isActive: boolean('is_active').default(true).notNull(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
