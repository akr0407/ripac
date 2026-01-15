ALTER TABLE "organizations" ADD COLUMN "logo" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "treating_doctors" ADD COLUMN "is_main" boolean DEFAULT false NOT NULL;