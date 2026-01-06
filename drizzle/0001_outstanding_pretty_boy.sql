CREATE TABLE `audit_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`homophoneId` int NOT NULL,
	`auditorId` int NOT NULL,
	`action` enum('approve','reject') NOT NULL,
	`opinion` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditor_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auditorId` int NOT NULL,
	`categoryId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditor_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentId` int NOT NULL DEFAULT 0,
	`name` varchar(100) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`level` tinyint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `english_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`englishText` varchar(500) NOT NULL,
	`chineseTranslation` text NOT NULL,
	`ipa` varchar(200),
	`syllables` varchar(200),
	`categoryId` int NOT NULL,
	`queryCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `english_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entry_category_relations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entryId` int NOT NULL,
	`categoryId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `entry_category_relations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homophones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entryId` int NOT NULL,
	`homophoneText` varchar(500) NOT NULL,
	`auditStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`submitterId` int NOT NULL,
	`auditOpinion` text,
	`approvalCount` int NOT NULL DEFAULT 0,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`auditDeadline` timestamp,
	CONSTRAINT `homophones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `query_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entryId` int NOT NULL,
	`queryTime` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `query_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configKey` varchar(100) NOT NULL,
	`configValue` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_configs_configKey_unique` UNIQUE(`configKey`)
);
--> statement-breakpoint
CREATE TABLE `unrecorded_words` (
	`id` int AUTO_INCREMENT NOT NULL,
	`word` varchar(500) NOT NULL,
	`requestCount` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `unrecorded_words_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','auditor') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `isDisabled` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `homophone_id_idx` ON `audit_records` (`homophoneId`);--> statement-breakpoint
CREATE INDEX `auditor_id_idx` ON `audit_records` (`auditorId`);--> statement-breakpoint
CREATE INDEX `auditor_id_idx` ON `auditor_permissions` (`auditorId`);--> statement-breakpoint
CREATE INDEX `parent_id_idx` ON `categories` (`parentId`);--> statement-breakpoint
CREATE INDEX `level_idx` ON `categories` (`level`);--> statement-breakpoint
CREATE INDEX `english_text_idx` ON `english_entries` (`englishText`);--> statement-breakpoint
CREATE INDEX `category_id_idx` ON `english_entries` (`categoryId`);--> statement-breakpoint
CREATE INDEX `query_count_idx` ON `english_entries` (`queryCount`);--> statement-breakpoint
CREATE INDEX `entry_id_idx` ON `entry_category_relations` (`entryId`);--> statement-breakpoint
CREATE INDEX `category_id_idx` ON `entry_category_relations` (`categoryId`);--> statement-breakpoint
CREATE INDEX `entry_id_idx` ON `homophones` (`entryId`);--> statement-breakpoint
CREATE INDEX `audit_status_idx` ON `homophones` (`auditStatus`);--> statement-breakpoint
CREATE INDEX `submitter_id_idx` ON `homophones` (`submitterId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `query_history` (`userId`);--> statement-breakpoint
CREATE INDEX `entry_id_idx` ON `query_history` (`entryId`);--> statement-breakpoint
CREATE INDEX `query_time_idx` ON `query_history` (`queryTime`);--> statement-breakpoint
CREATE INDEX `word_idx` ON `unrecorded_words` (`word`);--> statement-breakpoint
CREATE INDEX `request_count_idx` ON `unrecorded_words` (`requestCount`);