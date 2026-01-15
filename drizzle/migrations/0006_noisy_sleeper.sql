CREATE TABLE "countries" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(50),
	"name" text NOT NULL,
	"nationality" text NOT NULL,
	"iso" varchar(3),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
