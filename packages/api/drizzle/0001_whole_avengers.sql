ALTER TABLE `user` ADD `created_at` text DEFAULT (datetime('now')) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `updated_at` text DEFAULT (datetime('now')) NOT NULL;