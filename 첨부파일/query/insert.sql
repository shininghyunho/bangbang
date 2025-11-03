select * from users;

select * from listings;

select * from listing_schedule;

insert into users(email,password,name)
values('hyunho@email','hashed_password','hyunho');

insert into listings(hostId,name,guestCapacity,infantCapacity)
values
(1,'현호네_1번숙소',2,3),
(1,'현호네_2번숙소',4,3),
(1,'현호네_3번숙소',3,2);
insert into listing_schedule(listingId,date,price,isAvailable,createdAt,updatedAt)
values
(1,'2025-01-01',100,1,now(),now()),
(1,'2025-01-02',150,1,now(),now()),
(1,'2025-01-03',150,1,now(),now()),
(1,'2025-01-04',100,0,now(),now()),
(2,'2023-01-01',120,1,now(),now()),
(2,'2023-01-02',120,1,now(),now()),
(3,'2025-01-01',200,1,now(),now()),
(3,'2025-01-02',250,1,now(),now()),
(3,'2025-01-03',250,1,now(),now());


#delete from listing_schedule where `listingId`=2;
