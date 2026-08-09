CREATE TABLE `speaking_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_scope` text NOT NULL,
	`imported_at` text NOT NULL,
	`schema_version` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`content_hash` text NOT NULL,
	`review_json` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_speaking_sessions_owner_idempotency` ON `speaking_sessions` (`owner_scope`,`idempotency_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_speaking_sessions_owner_hash` ON `speaking_sessions` (`owner_scope`,`content_hash`);--> statement-breakpoint
CREATE INDEX `idx_speaking_sessions_owner_imported` ON `speaking_sessions` (`owner_scope`,`imported_at`);--> statement-breakpoint
PRAGMA optimize;
