use dev_db;

show tables;

select * from listings;
select * from listing_schedule;

SET @start_date = '2025-01-01';
SET @end_date = '2025-01-03';
SET @date_diff = 3;
SET @start_price=100000;
SET @end_price=130000

# schedule table select
select s.id, s.listingId, date, isAvailable
from listing_schedule as s
where s.date BETWEEN @start_date and @end_date
and s.price BETWEEN @start_price and @end_price
and s.isAvailable = 1
order by s.id
limit 10;

# select 조건 listing id
select s.listingId
from listing_schedule as s
where s.date BETWEEN '2023-01-01' and '2023-01-03'
and s.price BETWEEN 100 and 300
and s.isAvailable = 1;

# 숙소 설명
select l.id, l.name
from listings as l;

# 스케쥴 테이블 설명
select s.listingId as 숙소ID, s.date, s.price, s.isAvailable
from listing_schedule as s
order by s.listingId

# group by, having
select s.listingId as 숙소ID
from listing_schedule as s
where s.date BETWEEN '2023-01-01' and '2023-01-03'
and s.price BETWEEN 100 and 300
and s.isAvailable = 1
group by s.listingId
having count(s.date)=3;

# for sub query
select s2.listingId
from listing_schedule as s2
where s2.date BETWEEN '2023-01-01' and '2023-01-03'
and s2.price BETWEEN 100 and 300
and s2.isAvailable = 1
group by s2.listingId
having count(s2.date)=3;

# main query (without double check)
select l.id as 숙소ID, s.id as 스케쥴ID, s.date, s.isAvailable as 가능여부
from listings as l
join listing_schedule as s on l.id = s.listingId
where l.guestCapacity >= 1 and l.infantCapacity >=1
and s.listingId in (
    select s2.listingId
    from listing_schedule as s2
    where s2.date BETWEEN '2023-01-01' and '2023-01-03'
    and s2.price BETWEEN 100 and 300
    and s2.isAvailable = 1
    group by s2.listingId
    having count(s2.date)=3
);

# main query (with double check)
select l.* , s.*
from listings as l
join listing_schedule as s on l.id = s.listingId
where l.guestCapacity >= 1 and l.infantCapacity >=1
and s.listingId in (
    select s2.listingId
    from listing_schedule as s2
    where s2.date BETWEEN '2023-01-01' and '2023-01-03'
    and s2.price BETWEEN 100 and 300
    and s2.isAvailable = 1
    group by s2.listingId
    having count(s2.date)=3
)
and s.date BETWEEN '2023-01-01' and '2023-01-03'
and s.price BETWEEN 100 and 300
and s.isAvailable = 1;

# main query for PR
select l.id as 숙소ID, s.id as 스케쥴ID, s.date, s.isAvailable as 가능여부
from listings as l
join listing_schedule as s on l.id = s.listingId
where l.guestCapacity >= 1 and l.infantCapacity >=1
and s.listingId in (
    select s2.listingId
    from listing_schedule as s2
    where s2.date BETWEEN '2023-01-01' and '2023-01-03'
    and s2.price BETWEEN 100 and 300
    and s2.isAvailable = 1
    group by s2.listingId
    having count(s2.date)=3
)
and s.date BETWEEN '2023-01-01' and '2023-01-03'
and s.price BETWEEN 100 and 300
and s.isAvailable = 1;

# DBA
select l.*, s.*
from listings as l
join listing_schedule as s on l.id = s.listingId
where l.guestCapacity >= 1 and l.infantCapacity >=1
and l.id in (
    select s2.listingId
    from listing_schedule as s2
    where s2.date BETWEEN '2023-01-01' and '2023-01-03'
    and s2.price BETWEEN 100 and 300
    and s2.isAvailable = 1
    group by s2.listingId
    having count(distinct s2.date)=3
)
and s.date BETWEEN '2023-01-01' and '2023-01-03'
and s.price BETWEEN 100 and 300
and s.isAvailable = 1;

---------- user
select * from users where id=1001;