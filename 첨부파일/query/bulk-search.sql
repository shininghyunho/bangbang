# search
SET @start_date = '2015-01-01';
SET @end_date = '2015-01-03';
SET @date_diff = 2;
SET @start_price=100000;
SET @end_price=130000;


select l.id as 숙소ID, s.date, s.isAvailable as 가능여부
from listings as l
inner join listing_schedule as s on l.id = s.listingId
where l.guestCapacity >= 0 and l.infantCapacity >=0
and s.listingId in (
    select s2.listingId
    from listing_schedule as s2
    where s2.date BETWEEN @start_date and @end_date
    and s2.price BETWEEN @start_price and @end_price
    and s2.isAvailable = 1
    group by s2.listingId
    having count(s2.date) = @date_diff
)
and s.date BETWEEN @start_date and @end_date
and s.price BETWEEN @start_price and @end_price
and s.isAvailable = 1
limit 10;

# search (EXPLAIN)
explain select l.id as 숙소ID, s.date, s.isAvailable as 가능여부
from listings as l
inner join listing_schedule as s on l.id = s.listingId
where l.guestCapacity >= 0 and l.infantCapacity >=0
and s.listingId in (
    select s2.listingId
    from listing_schedule as s2
    where s2.date BETWEEN @start_date and @end_date
    and s2.price BETWEEN @start_price and @end_price
    and s2.isAvailable = 1
    group by s2.listingId
    having count(s2.date) = @date_diff
)
and s.date BETWEEN @start_date and @end_date
and s.price BETWEEN @start_price and @end_price
and s.isAvailable = 1
limit 10;

select s2.listingId
from listing_schedule_bulk as s 
where s2.date BETWEEN '2024-01-01' and '2024-01-03' 
and s2.price BETWEEN 100 and 200000 
and s2.isAvailable = 1
group by s2.listingId
having count(s2.date) = 3

# select
select * from listings_bulk limit 10;
select * from listing_schedule_bulk limit 10;