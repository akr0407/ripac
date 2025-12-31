import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { registrations } from './registrations';

export const medicalHistory = pgTable('medical_history', {
    id: uuid('id').defaultRandom().primaryKey(),
    registrationId: uuid('registration_id').references(() => registrations.id).notNull(),
    presentComplaint: text('present_complaint'),
    pastMedicalHistory: text('past_medical_history'),
    allergicHistory: text('allergic_history'),
    currentMedication: text('current_medication'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type MedicalHistory = typeof medicalHistory.$inferSelect;
export type NewMedicalHistory = typeof medicalHistory.$inferInsert;
