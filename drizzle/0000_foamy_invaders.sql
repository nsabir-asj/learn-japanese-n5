CREATE TABLE `user_progress` (
	`user_id` text PRIMARY KEY NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`stores_json` text DEFAULT '{}' NOT NULL,
	`recent_mutation_ids_json` text DEFAULT '[]' NOT NULL,
	`updated_at` integer NOT NULL
);
