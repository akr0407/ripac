import { pgTable, uuid, integer, timestamp } from 'drizzle-orm/pg-core';
import { registrations } from './registrations';
import { doctors } from './doctors';

export const treatingDoctors = pgTable('treating_doctors', {
    id: uuid('id').defaultRandom().primaryKey(),
    registrationId: uuid('registration_id').references(() => registrations.id).notNull(),
    doctorId: uuid('doctor_id').references(() => doctors.id).notNull(),
    doctorSequence: integer('doctor_sequence').notNull(),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
});

export type TreatingDoctor = typeof treatingDoctors.$inferSelect;
export type NewTreatingDoctor = typeof treatingDoctors.$inferInsert;
