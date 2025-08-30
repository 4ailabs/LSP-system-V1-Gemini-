CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`message_id` text,
	`title` text,
	`description` text,
	`image_data` blob NOT NULL,
	`mime_type` text NOT NULL,
	`created_at` integer DEFAULT 1756514862686 NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`session_id` text NOT NULL,
	`content` text NOT NULL,
	`category` text,
	`created_at` integer DEFAULT 1756514862686 NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`is_insight` integer DEFAULT false,
	`created_at` integer DEFAULT 1756514862685 NOT NULL,
	`order_index` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `phases` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`order` integer NOT NULL,
	`is_active` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`current_phase` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT 1756514862685 NOT NULL,
	`updated_at` integer DEFAULT 1756514862685 NOT NULL,
	`user_id` text
);
