import { pgTable, uuid, varchar, date, timestamp } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const registrations = pgTable('registrations', {
    id: uuid('id').defaultRandom().primaryKey(),
    patientId: uuid('patient_id').references(() => patients.id).notNull(),
    registrationNumber: varchar('registration_number', { length: 50 }).notNull().unique(),
    admissionDate: date('admission_date'),
    dischargeDate: date('discharge_date'),
    ward: varchar('ward', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;
