import { pgTable, uuid, varchar, date, timestamp, index } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { organizations } from './organizations';

export const registrations = pgTable('registrations', {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    patientId: uuid('patient_id').references(() => patients.id).notNull(),
    registrationNumber: varchar('registration_number', { length: 50 }).notNull(),
    admissionDate: date('admission_date'),
    dischargeDate: date('discharge_date'),
    ward: varchar('ward', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('registrations_org_idx').on(table.organizationId),
]);

export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;

