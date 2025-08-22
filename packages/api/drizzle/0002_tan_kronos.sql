CREATE INDEX `idx_account_user_id` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_transaction_account_id` ON `transaction` (`account_id`);--> statement-breakpoint
CREATE INDEX `idx_transaction_account_date` ON `transaction` (`account_id`,`date`);