show tables;

select count(*) from listings;
select * from listings limit 10;
select count(*) from listing_schedule;
select * from listing_schedule limit 10;
select count(*) from users;
select * from users limit 10;

------

-- users 테이블 구조 변경
ALTER TABLE users -- 이전 요청에 따라 수정
    MODIFY COLUMN email VARCHAR(50) NOT NULL,
    MODIFY COLUMN password VARCHAR(50) NOT NULL,
    MODIFY COLUMN name VARCHAR(20) NOT NULL;

-- listings 테이블 구조 변경
ALTER TABLE listings
    MODIFY COLUMN name VARCHAR(50) NOT NULL,
    MODIFY COLUMN description TEXT,
    MODIFY COLUMN guestCapacity INT NOT NULL DEFAULT 1,
    MODIFY COLUMN infantCapacity INT NOT NULL DEFAULT 0,
    MODIFY COLUMN address VARCHAR(100);
ALTER TABLE listings ADD CONSTRAINT fk_listings_hostId
    FOREIGN KEY (hostId) REFERENCES users(id);
ALTER TABLE listings ADD INDEX idx_capacity (guestCapacity, infantCapacity);

--- 숙소 스케쥴
ALTER TABLE listing_schedule MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY;

ALTER TABLE listing_schedule
MODIFY COLUMN listingId BIGINT NOT NULL,
    MODIFY COLUMN date DATE NOT NULL,
    MODIFY COLUMN price DECIMAL(10, 2) NOT NULL,
    MODIFY COLUMN isAvailable BOOLEAN NOT NULL DEFAULT TRUE,
    MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE listing_schedule ADD CONSTRAINT fk_schedule_listingId
    FOREIGN KEY (listingId) REFERENCES listings(id) ON DELETE CASCADE;

DROP INDEX idx_search_01 ON listing_schedule;
CREATE INDEX idx_search ON listing_schedule (isAvailable ,date, price, listingId);
CREATE INDEX idx_join ON listing_schedule (listingId, isAvailable, date, price);