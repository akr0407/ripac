CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"registration_number" varchar(50) NOT NULL,
	"admission_date" date,
	"discharge_date" date,
	"ward" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
ALTER TABLE "patients" DROP CONSTRAINT "patients_registration_number_unique";--> statement-breakpoint
ALTER TABLE "medical_history" DROP CONSTRAINT "medical_history_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "vital_signs" DROP CONSTRAINT "vital_signs_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "examinations" DROP CONSTRAINT "examinations_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_recommendations" DROP CONSTRAINT "doctor_recommendations_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "treating_doctors" DROP CONSTRAINT "treating_doctors_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "medical_history" ADD COLUMN "registration_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD COLUMN "registration_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "examinations" ADD COLUMN "registration_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_recommendations" ADD COLUMN "registration_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "treating_doctors" ADD COLUMN "registration_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "registration_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_history" ADD CONSTRAINT "medical_history_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_recommendations" ADD CONSTRAINT "doctor_recommendations_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treating_doctors" ADD CONSTRAINT "treating_doctors_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "registration_number";--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "registration_date";--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "admission_date";--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "discharge_date";--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "ward";--> statement-breakpoint
ALTER TABLE "medical_history" DROP COLUMN "patient_id";--> statement-breakpoint
ALTER TABLE "vital_signs" DROP COLUMN "patient_id";--> statement-breakpoint
ALTER TABLE "examinations" DROP COLUMN "patient_id";--> statement-breakpoint
ALTER TABLE "doctor_recommendations" DROP COLUMN "patient_id";--> statement-breakpoint
ALTER TABLE "treating_doctors" DROP COLUMN "patient_id";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "patient_id";--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_mr_number_unique" UNIQUE("mr_number");