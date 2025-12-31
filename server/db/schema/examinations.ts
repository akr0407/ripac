import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { registrations } from './registrations';

export const examinations = pgTable('examinations', {
    id: uuid('id').defaultRandom().primaryKey(),
    registrationId: uuid('registration_id').references(() => registrations.id).notNull(),
    physicalExamination: text('physical_examination'),
    otherExamination: text('other_examination'),
    diagnosis: text('diagnosis'),
    differentialDiagnosis: text('differential_diagnosis'),
    treatment: text('treatment'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Examination = typeof examinations.$inferSelect;
export type NewExamination = typeof examinations.$inferInsert;
