import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const countries = pgTable('countries', {
    id: text('id').primaryKey(),
    code: varchar('code', { length: 50 }).unique(), // ISO requires 2, but manual entries need more
    name: text('name').notNull(),
    nationality: text('nationality').notNull(),
    iso: varchar('iso', { length: 3 }), // Numeric code usually? JSON has "53"
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
