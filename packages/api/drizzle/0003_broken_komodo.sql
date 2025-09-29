ALTER TABLE "account" ALTER COLUMN "timezone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bot_state" jsonb;