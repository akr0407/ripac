import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { registrations } from './registrations';

export const comments = pgTable('comments', {
    id: uuid('id').defaultRandom().primaryKey(),
    registrationId: uuid('registration_id').references(() => registrations.id).notNull(),
    commentText: text('comment_text').notNull(),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
