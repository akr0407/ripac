ALTER TABLE "patients" ADD COLUMN "external_registration_no" varchar(100);--> statement-breakpoint
ALTER TABLE "doctor_recommendations" ADD COLUMN "can_be_transported_note" text;--> statement-breakpoint
ALTER TABLE "doctor_recommendations" ADD COLUMN "fit_to_fly_note" text;--> statement-breakpoint
ALTER TABLE "doctor_recommendations" ADD COLUMN "needs_wheelchair_note" text;--> statement-breakpoint
ALTER TABLE "doctor_recommendations" ADD COLUMN "updated_at" timestamp;