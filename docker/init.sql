CREATE TABLE `users` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `email` varchar(50) NOT NULL,
    `password` varchar(50) NOT NULL,
    `name` varchar(20) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE `listings` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `hostId` bigint DEFAULT NULL,
    `name` varchar(50) NOT NULL,
    `description` text,
    `guestCapacity` int NOT NULL DEFAULT '1',
    `infantCapacity` int NOT NULL DEFAULT '0',
    `address` varchar(100) DEFAULT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_listings_hostId` FOREIGN KEY (`hostId`) REFERENCES `users` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE `listing_schedule` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `listingId` bigint NOT NULL,
    `date` date NOT NULL,
    `price` decimal(10, 2) NOT NULL,
    `isAvailable` tinyint(1) NOT NULL DEFAULT '1',
    `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_search_01` (`date`, `price`),
    CONSTRAINT `fk_schedule_listingId` FOREIGN KEY (`listingId`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE `providers` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(20) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `oauth_accounts` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `user_id` bigint NOT NULL,
    `provider_id` int NOT NULL,
    `provider_user_id` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_oauth_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_oauth_provider_id` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;