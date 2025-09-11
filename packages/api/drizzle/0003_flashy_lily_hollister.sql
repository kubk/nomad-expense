CREATE TABLE `transaction_import_rule` (
	`name` text NOT NULL,
	`account_id` text NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_transaction_import_rule_account_id` ON `transaction_import_rule` (`account_id`);--> statement-breakpoint
ALTER TABLE `transaction` ADD `info` text;