import { pgTable, uuid, varchar, date, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { organizations } from './organizations';
import { doctors } from './doctors';

export const registrations = pgTable('registrations', {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    patientId: uuid('patient_id').references(() => patients.id).notNull(),
    registrationNumber: varchar('registration_number', { length: 50 }).notNull(),
    admissionDate: date('admission_date'),
    dischargeDate: date('discharge_date'),
    ward: varchar('ward', { length: 100 }),
    managerOnDutyId: uuid('manager_on_duty_id').references(() => doctors.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('registrations_org_idx').on(table.organizationId),
    uniqueIndex('registrations_number_unique_idx').on(table.registrationNumber),
]);

// Actually, better to just use unique() on the column definition or uniqueIndex


export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;

