ALTER TABLE "user" ADD COLUMN "browser_token" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_browser_token_unique" UNIQUE("browser_token");