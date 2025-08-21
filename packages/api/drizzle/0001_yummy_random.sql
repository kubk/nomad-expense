PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_transaction` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`account_id` text NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`usd_amount` integer NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_transaction`("id", "account_id", "description", "amount", "currency", "usd_amount", "date") SELECT "id", "account_id", "description", "amount", "currency", "usd_amount", "date" FROM `transaction`;--> statement-breakpoint
DROP TABLE `transaction`;--> statement-breakpoint
ALTER TABLE `__new_transaction` RENAME TO `transaction`;--> statement-breakpoint
PRAGMA foreign_keys=ON;