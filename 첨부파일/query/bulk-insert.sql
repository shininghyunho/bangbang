-- 재귀 상한선 1000만
SET cte_max_recursion_depth = 10000000;

-------------------------------------------- users

select * from users limit 10;

SET @user_cnt = 1000;
-- users
CREATE TABLE users_bulk AS
WITH RECURSIVE cte(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1
    FROM cte
    WHERE n < @user_cnt
)
SELECT
    n AS id,
    CONCAT('email:', n) AS email,
    'PASSWORD',
    CONCAT('hyunho:', n) AS name
FROM cte;

select count(*) from users_bulk; -- 1000개 
select * from users_bulk limit 10;

-------------------------------------------- listings
select * from listings limit 10;

SET @listing_cnt = 1000;

CREATE TABLE listings_bulk AS
WITH RECURSIVE cte(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1
    FROM cte
    WHERE n < @listing_cnt
)
SELECT
    n AS id,
    n AS hostId,
    CONCAT('현호', n,'의_숙소') AS name,
    CONCAT('현호', n, '의_멋진_숙소입니다.') AS description,
    (n % 5) + 1 AS guestCapacity,
    (n % 3) AS infantCapacity,
    CONCAT('코드스쿼드 ', (n%10) ,'번지') AS address
FROM cte;

select count(*) from listings_bulk; -- 1000개.
select * from listings_bulk limit 10;


-------------------------------------------- listing schedule
SET cte_max_recursion_depth = 10000000;

SET @listing_cnt = 1000;
SET @start_date = '2015-01-01';
SET @end_date = '2024-12-31';

CREATE TABLE listing_schedule_bulk AS
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
  ROW_NUMBER() OVER () AS id,
  l.id AS listingId,
  d.dt AS date,
  (50 + FLOOR(RAND() * 100)) * 1000 AS price, -- 5만 ~ 14만9천
  IF(RAND() > 0.5, TRUE, FALSE) AS isAvailable, -- 예약 확률 50%
  NOW() AS createdAt,
  NOW() AS updatedAt
FROM
  listing_ids l
CROSS JOIN
  all_dates d;

select count(*) from listing_schedule_bulk;
select * from listing_schedule_bulk limit 10;

-------------------------------------------- provider
select * from providers;

insert into providers (name)
values('kakao');

-------------------------------------------- oauth_accounts


select * from oauth_accounts;
