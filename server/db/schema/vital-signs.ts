import { pgTable, uuid, varchar, decimal, integer, timestamp } from 'drizzle-orm/pg-core';
import { registrations } from './registrations';

export const vitalSigns = pgTable('vital_signs', {
    id: uuid('id').defaultRandom().primaryKey(),
    registrationId: uuid('registration_id').references(() => registrations.id).notNull(),
    pulseRate: decimal('pulse_rate', { precision: 5, scale: 1 }),
    bloodPressure: varchar('blood_pressure', { length: 20 }),
    respiratoryRate: decimal('respiratory_rate', { precision: 5, scale: 1 }),
    temperature: decimal('temperature', { precision: 4, scale: 1 }),
    spo2: decimal('spo2', { precision: 5, scale: 1 }),
    gcs: integer('gcs'),
    recordedAt: timestamp('recorded_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type VitalSign = typeof vitalSigns.$inferSelect;
export type NewVitalSign = typeof vitalSigns.$inferInsert;
