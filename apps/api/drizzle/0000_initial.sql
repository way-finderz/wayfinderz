CREATE TABLE "cities" (
	"id" text PRIMARY KEY NOT NULL,
	"journey_id" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edges" (
	"id" text PRIMARY KEY NOT NULL,
	"from_city_id" text NOT NULL,
	"to_city_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"language" text NOT NULL,
	"start_city_name" text NOT NULL,
	"target_city_name" text NOT NULL,
	"emoji" text DEFAULT '🗺️',
	"win_message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "journeys_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "journey_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"journey_id" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"best_time_ms" integer,
	"last_completed_at" timestamp,
	"completion_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "journey_progress_user_id_journey_id_unique" UNIQUE("user_id","journey_id")
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" text PRIMARY KEY NOT NULL,
	"journey_id" text NOT NULL,
	"source_word" text NOT NULL,
	"target_word" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"created_by_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "invite_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "invite_uses" (
	"id" text PRIMARY KEY NOT NULL,
	"invite_code_id" text NOT NULL,
	"used_by_id" text NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edges" ADD CONSTRAINT "edges_from_city_id_cities_id_fk" FOREIGN KEY ("from_city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edges" ADD CONSTRAINT "edges_to_city_id_cities_id_fk" FOREIGN KEY ("to_city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_progress" ADD CONSTRAINT "journey_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_progress" ADD CONSTRAINT "journey_progress_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_uses" ADD CONSTRAINT "invite_uses_invite_code_id_invite_codes_id_fk" FOREIGN KEY ("invite_code_id") REFERENCES "public"."invite_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_uses" ADD CONSTRAINT "invite_uses_used_by_id_users_id_fk" FOREIGN KEY ("used_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
