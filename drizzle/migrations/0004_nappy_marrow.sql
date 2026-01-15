ALTER TABLE "organizations" ADD COLUMN "phone" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "fax" varchar(50);--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "manager_on_duty_id" uuid;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_manager_on_duty_id_doctors_id_fk" FOREIGN KEY ("manager_on_duty_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;