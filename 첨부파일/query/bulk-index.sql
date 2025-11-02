select * from listing_schedule_bulk limit 5;

CREATE INDEX idx_join_01 ON listing_schedule_bulk (listingId, date);
CREATE INDEX idx_join_02 ON listing_schedule_bulk (date); -- 30ms
CREATE INDEX idx_join_03 ON listing_schedule_bulk (price);
CREATE INDEX idx_join_04 ON listing_schedule_bulk (date,price); -- 20ms
CREATE INDEX idx_join_05 ON listing_schedule_bulk (price,date);
CREATE INDEX idx_join_06 ON listing_schedule_bulk (date, listingId);


DROP INDEX idx_join_01 ON listing_schedule_bulk;
DROP INDEX idx_join_02 ON listing_schedule_bulk;
DROP INDEX idx_join_03 ON listing_schedule_bulk;
DROP INDEX idx_join_04 ON listing_schedule_bulk;
DROP INDEX idx_join_05 ON listing_schedule_bulk;
DROP INDEX idx_join_06 ON listing_schedule_bulk;

---
DROP INDEX IDX_search_01 ON listing_schedule;