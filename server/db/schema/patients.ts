import { pgTable, uuid, varchar, text, integer, date, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const ageUnitEnum = pgEnum('age_unit', ['years', 'months', 'days']);
export const sexEnum = pgEnum('sex', ['male', 'female']);

// Patient master data - basic info only
export const patients = pgTable('patients', {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    mrNumber: varchar('mr_number', { length: 50 }),
    externalRegistrationNo: varchar('external_registration_no', { length: 100 }), // Reference to hospital registration
    fullName: varchar('full_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    age: integer('age'),
    ageUnit: ageUnitEnum('age_unit').default('years'),
    nationality: varchar('nationality', { length: 100 }),
    sex: sexEnum('sex'),
    dateOfBirth: date('date_of_birth'),
    currentAddress: text('current_address'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('patients_org_idx').on(table.organizationId),
]);

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

