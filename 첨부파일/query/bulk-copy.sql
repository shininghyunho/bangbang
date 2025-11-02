select * from users_bulk limit 10;
select * from users limit 10;

INSERT INTO users (email, password, name)
SELECT
    email,
    `PASSWORD`, 
    name
FROM users_bulk;

INSERT INTO listings (hostId, name, description, guestCapacity, infantCapacity, address)
SELECT
    hostId,
    name,
    description,
    guestCapacity,
    infantCapacity,
    address
FROM listings_bulk;

INSERT INTO listing_schedule (listingId, date, price, isAvailable, createdAt, updatedAt)
SELECT
    listingId,
    date,
    price,
    isAvailable,
    createdAt,
    updatedAt
FROM listing_schedule_bulk;

---
select count(*) from users;
select count(*) from listings;
select count(*) from listing_schedule;

select * from users limit 10;
