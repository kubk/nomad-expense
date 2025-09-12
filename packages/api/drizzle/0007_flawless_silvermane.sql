CREATE UNIQUE INDEX `user_telegram_id_unique` ON `user` (`telegram_id`);--> statement-breakpoint
CREATE INDEX `idx_user_telegram_id` ON `user` (`telegram_id`);