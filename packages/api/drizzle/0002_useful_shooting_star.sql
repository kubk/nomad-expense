ALTER TABLE `transaction` ADD `source` text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction` ADD `is_countable` integer DEFAULT true NOT NULL;