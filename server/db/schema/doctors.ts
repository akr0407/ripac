import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const doctors = pgTable('doctors', {
    id: uuid('id').defaultRandom().primaryKey(),
    doctorId: varchar('doctor_id', { length: 50 }).unique().notNull(),
    nickName: varchar('nick_name', { length: 100 }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    address: text('address'),
    phone1: varchar('phone_1', { length: 20 }),
    phone2: varchar('phone_2', { length: 20 }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;
