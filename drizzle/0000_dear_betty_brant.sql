CREATE TYPE "public"."role" AS ENUM('Product-Manager', 'Developer');--> statement-breakpoint
CREATE TYPE "public"."strategy" AS ENUM('NO_STRATEGY', 'FUTURE_IMPLEMENTATIONS');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"user_email" varchar(255),
	"action" varchar(255) NOT NULL,
	"entity" varchar(255) NOT NULL,
	"entity_id" integer NOT NULL,
	"entity_name" varchar(255),
	"old_value" jsonb,
	"new_value" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255),
	"is_active" boolean NOT NULL,
	"description" text,
	"strategy" "strategy" DEFAULT 'NO_STRATEGY' NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"role" "role" DEFAULT 'Developer' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "feature_flag_name_unique" ON "feature_flags" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "email_unique_idx" ON "users" USING btree ("email");