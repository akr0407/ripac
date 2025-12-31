import { pgTable, uuid, boolean, text, timestamp } from 'drizzle-orm/pg-core';
import { registrations } from './registrations';

export const doctorRecommendations = pgTable('doctor_recommendations', {
    id: uuid('id').defaultRandom().primaryKey(),
    registrationId: uuid('registration_id').references(() => registrations.id).notNull(),
    requestRepatriation: boolean('request_repatriation'),
    requiresEvacuation: boolean('requires_evacuation'),
    canBeTransported: boolean('can_be_transported'),
    fitToFly: boolean('fit_to_fly'),
    needsWheelchair: boolean('needs_wheelchair'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type DoctorRecommendation = typeof doctorRecommendations.$inferSelect;
export type NewDoctorRecommendation = typeof doctorRecommendations.$inferInsert;
