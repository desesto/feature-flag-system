CREATE TYPE "public"."action_type" AS ENUM('CREATED', 'UPDATED', 'DELETED', 'ACTIVATED', 'DEACTIVATED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('Product-Manager', 'Developer');--> statement-breakpoint
CREATE TYPE "public"."strategy" AS ENUM('NO_STRATEGY', 'FUTURE_IMPLEMENTATIONS');--> statement-breakpoint
CREATE TABLE "feature_flag_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_flag_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"action_type" "action_type" NOT NULL,
	"changed_fields" text,
	"old_values" text,
	"new_values" text
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
ALTER TABLE "feature_flag_history" ADD CONSTRAINT "feature_flag_history_feature_flag_id_feature_flags_id_fk" FOREIGN KEY ("feature_flag_id") REFERENCES "public"."feature_flags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag_history" ADD CONSTRAINT "feature_flag_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "feature_flag_name_unique" ON "feature_flags" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "email_unique_idx" ON "users" USING btree ("email");