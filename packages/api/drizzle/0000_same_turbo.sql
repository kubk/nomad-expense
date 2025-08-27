CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`family_id` text NOT NULL,
	`name` text NOT NULL,
	`currency` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_account_family_id` ON `account` (`family_id`);--> statement-breakpoint
CREATE TABLE `invite` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`family_id` text NOT NULL,
	`invited_by_user_id` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`used_by_user_id` text,
	FOREIGN KEY (`invited_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`used_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invite_code_unique` ON `invite` (`code`);--> statement-breakpoint
CREATE INDEX `idx_invite_code` ON `invite` (`code`);--> statement-breakpoint
CREATE INDEX `idx_invite_family_id` ON `invite` (`family_id`);--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`account_id` text NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`usd_amount` integer NOT NULL,
	`type` text DEFAULT 'expense' NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_transaction_account_id` ON `transaction` (`account_id`);--> statement-breakpoint
CREATE INDEX `idx_transaction_type` ON `transaction` (`type`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`family_id` text NOT NULL,
	`initial_family_id` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`username` text,
	`avatar_url` text
);
