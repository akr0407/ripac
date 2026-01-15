import { pgTable, uuid, boolean, text, timestamp } from 'drizzle-orm/pg-core';
import { registrations } from './registrations';

export const doctorRecommendations = pgTable('doctor_recommendations', {
    id: uuid('id').defaultRandom().primaryKey(),
    registrationId: uuid('registration_id').references(() => registrations.id).notNull(),
    requestRepatriation: boolean('request_repatriation'),
    requiresEvacuation: boolean('requires_evacuation'),
    canBeTransported: boolean('can_be_transported'),
    canBeTransportedNote: text('can_be_transported_note'),
    fitToFly: boolean('fit_to_fly'),
    fitToFlyNote: text('fit_to_fly_note'),
    needsWheelchair: boolean('needs_wheelchair'),
    needsWheelchairNote: text('needs_wheelchair_note'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at'),
});

export type DoctorRecommendation = typeof doctorRecommendations.$inferSelect;
export type NewDoctorRecommendation = typeof doctorRecommendations.$inferInsert;
