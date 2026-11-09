CREATE TABLE "bank_connection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"family_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"credentials" jsonb NOT NULL,
	"last_synced_at" timestamp with time zone,
	"last_sync_error" text
);
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "bank_connection_id" uuid;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "external_id" varchar;--> statement-breakpoint
CREATE INDEX "idx_bank_connection_family_id" ON "bank_connection" USING btree ("family_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_bank_connection_id_bank_connection_id_fk" FOREIGN KEY ("bank_connection_id") REFERENCES "public"."bank_connection"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_transaction_account_id_external_id" ON "transaction" USING btree ("account_id","external_id");