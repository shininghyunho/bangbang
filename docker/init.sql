------------------------------------------------------------------------------------------------ DDL

CREATE TABLE `users` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `email` varchar(50) NOT NULL,
    `password` varchar(50) NOT NULL,
    `name` varchar(20) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
    UNIQUE KEY `uq_provider_providerUserId` (`provider_id`,`provider_user_id`),
    CONSTRAINT `fk_oauth_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_oauth_provider_id` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


------------------------------------------------------------------------------------------------ insert

-- 재귀 상한선 1000만
SET cte_max_recursion_depth = 10000;

-------------------------------------------- users
SET @user_cnt = 1000;
-- users
INSERT INTO users (email, password, name)
WITH RECURSIVE cte(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1
    FROM cte
    WHERE n <= @user_cnt
)
SELECT
    CONCAT('email:', n),
    'PASSWORD',
    CONCAT('hyunho:', n)
FROM cte;

-------------------------------------------- listings

SET @listing_cnt = 1000;

INSERT INTO listings (hostId, name, description, guestCapacity, infantCapacity, address)
WITH RECURSIVE cte(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1
    FROM cte
    WHERE n <= @listing_cnt
)
SELECT
    n,
    CONCAT('현호', n,'의_숙소') AS name,
    CONCAT('현호', n, '의_멋진_숙소입니다.') AS description,
    (n % 5) + 1 AS guestCapacity,
    (n % 3) AS infantCapacity,
    CONCAT('코드스쿼드 ', (n%10) ,'번지') AS address
FROM cte;

-------------------------------------------- listing schedule
SET @start_date = '2025-01-01';
SET @end_date = '2025-12-31';

INSERT INTO listing_schedule (listingId, date, price, isAvailable, createdAt, updatedAt)
WITH RECURSIVE
  -- 1부터 @listing_cnt까지의 숙소 ID를 생성하는 CTE
  listing_ids(id) AS (
    SELECT 1
    UNION ALL
    SELECT id + 1 FROM listing_ids WHERE id < @listing_cnt
  ),
  -- @start_date부터 @end_date까지 모든 날짜를 생성하는 CTE
  all_dates(dt) AS (
    SELECT CAST(@start_date AS DATE)
    UNION ALL
    SELECT dt + INTERVAL 1 DAY FROM all_dates WHERE dt < @end_date
  )
SELECT
  l.id AS listingId,
  d.dt AS date,
  (50 + FLOOR(RAND() * 100)) * 1000 AS price, -- 5만 ~ 14만9천
  IF(RAND() > 0.1, TRUE, FALSE) AS isAvailable, -- 예약 확률 10%
  NOW() AS createdAt,
  NOW() AS updatedAt
FROM
  listing_ids l
CROSS JOIN
  all_dates d;


-------------------------------------------- provider
select * from providers;

insert into providers (name)
values('kakao');

-------------------------------------------- oauth_accounts


select * from oauth_accounts;
