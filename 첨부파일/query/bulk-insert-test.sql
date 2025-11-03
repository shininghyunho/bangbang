select * from listings;

select * from listing_schedule;

# create as select
create table listing_date_price as
select listingId,date,price
from listing_schedule
order by listingId, date;

# create as select table!
select * from listing_date_price;

# CTE (계층형 쿼리)
with listing_totals as (
    select listingId, SUM(price) as totalPrice
    from listing_schedule
    group by listingId
)
select listingId, totalPrice
from listing_totals
order by listingId;

# 재귀 CTE
WITH RECURSIVE cte(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1
    FROM cte
    WHERE n < 5
)
SELECT * FROM cte;

# 재귀 CTE (with create)
CREATE TABLE cte_test AS
WITH RECURSIVE cte(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1
    FROM cte
    WHERE n < 5
)
SELECT * FROM cte;

select * from cte_test;

# EXPLAIN
EXPLAIN
WITH RECURSIVE cte(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1
    FROM cte
    WHERE n < 5
)
SELECT * FROM cte;

-- CTE 깊이 최대 10만으로 설정.
SET cte_max_recursion_depth = 100000;

# listing bulk insert
CREATE TABLE listing_bulk2 AS
WITH RECURSIVE cte(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1
    FROM cte
    WHERE n < 100000
)
SELECT
    n AS id,
    1 AS hostId,
    CONCAT('대량 생성 숙소 ', n) AS name,
    CONCAT('숙소 번호 ', n, '의 상세 설명입니다.') AS description,
    (n % 5) + 1 AS guestCapacity,
    (n % 3) AS infantCapacity,
    CONCAT('서울시 강남구 테스트로 ', n) AS address
FROM cte;

select * from listing_bulk2 limit 10;
select count(*) from listing_bulk2;
drop table listing_bulk2;