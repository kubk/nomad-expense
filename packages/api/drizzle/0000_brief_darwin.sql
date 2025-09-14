CREATE TYPE "public"."account_color" AS ENUM('blue', 'green', 'purple', 'red', 'orange', 'yellow', 'pink', 'teal', 'cyan', 'lime', 'amber', 'emerald', 'rose', 'gray');--> statement-breakpoint
CREATE TYPE "public"."bank" AS ENUM('Wise', 'YapiKredi', 'Kasikorn', 'Tinkoff');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'INR', 'KRW', 'SGD', 'HKD', 'NZD', 'MXN', 'BRL', 'ZAR', 'THB', 'TRY', 'AED', 'BDT', 'UAH', 'KZT', 'PHP', 'MMK', 'USDT', 'BTC', 'ETH');--> statement-breakpoint
CREATE TYPE "public"."transaction_import_rule_type" AS ENUM('MakeUncountable', 'FilterTransactionName');--> statement-breakpoint
CREATE TYPE "public"."transaction_source" AS ENUM('imported', 'manual');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('expense', 'income');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"family_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"currency" "currency" NOT NULL,
	"color" "account_color" NOT NULL,
	"bank_type" "bank",
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"family_id" uuid NOT NULL,
	"invited_by_user_id" uuid NOT NULL,
	"code" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"used_by_user_id" uuid,
	CONSTRAINT "invite_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "transaction_import_rule" (
	"name" varchar NOT NULL,
	"account_id" uuid NOT NULL,
	"type" "transaction_import_rule_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" uuid NOT NULL,
	"description" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" "currency" NOT NULL,
	"info" text,
	"source" "transaction_source" DEFAULT 'manual' NOT NULL,
	"is_countable" boolean DEFAULT true NOT NULL,
	"usd_amount" integer NOT NULL,
	"type" "transaction_type" DEFAULT 'expense' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"family_id" uuid NOT NULL,
	"initial_family_id" uuid NOT NULL,
	"name" varchar,
	"username" varchar,
	"avatar_url" text,
	"telegram_id" varchar,
	"is_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_invited_by_user_id_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_used_by_user_id_user_id_fk" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_import_rule" ADD CONSTRAINT "transaction_import_rule_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_account_family_id" ON "account" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "idx_invite_code" ON "invite" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_invite_family_id" ON "invite" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "idx_transaction_import_rule_account_id" ON "transaction_import_rule" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_transaction_account_id" ON "transaction" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_transaction_account_id_created_at" ON "transaction" USING btree ("account_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_transaction_type" ON "transaction" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_user_telegram_id" ON "user" USING btree ("telegram_id");