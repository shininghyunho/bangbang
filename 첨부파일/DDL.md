# 숙소.
```sql
CREATE TABLE listings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hostId BIGINT NOT NULL, -- (users 테이블을 참조)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- 검색 조건 (용량)
    guestCapacity INT NOT NULL DEFAULT 1,
    infantCapacity INT NOT NULL DEFAULT 0,
    
    -- 기타 정보
    address VARCHAR(255),
   
    FOREIGN KEY (hostId) REFERENCES users(id),
    
    -- 인덱스: 용량 검색
    INDEX IDX_capacity (guestCapacity, infantCapacity)
);
```
# 숙소 스케쥴.
```sql
CREATE TABLE listing_schedule ( -- 테이블명 변경
    listingId BIGINT NOT NULL,
    date DATE NOT NULL,
    
    -- 검색 조건 (가격)
    price DECIMAL(10, 2) NOT NULL, -- 그날의 확정 가격
    
    -- 검색 조건 (예약 가능 여부)
    isAvailable BOOLEAN NOT NULL DEFAULT true, -- 컬럼명 변경 (true: 가능, false: 불가능)
    
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- PK 설정
    PRIMARY KEY (listingId, date),
    
    -- 외래 키
    FOREIGN KEY (listingId) REFERENCES listings(id) ON DELETE CASCADE,
    
    -- *** 가장 중요한 검색 인덱스 ***
    -- 인덱스에도 변경된 컬럼명(isAvailable) 적용
    INDEX IDX_search (date, isAvailable, price, listingId)
);
```
# 예약.
```sql
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    listingId BIGINT NOT NULL,
    userId BIGINT NOT NULL, -- (users 테이블을 참조)
    
    checkInDate DATE NOT NULL,
    checkOutDate DATE NOT NULL,
    
    guestCount INT NOT NULL,
    infantCount INT NOT NULL,
    
    totalPrice DECIMAL(10, 2) NOT NULL, -- 예약 시점의 총 결제 금액
    
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, DONE
    
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 외래 키
    FOREIGN KEY (listingId) REFERENCES listings(id),
    FOREIGN KEY (userId) REFERENCES users(id),
    
    -- 인덱스: (숙소 주인용) 숙소별 예약 목록, (사용자용) 나의 예약 목록
    INDEX IDX_listing_dates (listingId, checkInDate, checkOutDate),
    INDEX IDX_user_bookings (userId, checkInDate)
);
```
# 사용자.
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hashed
    name VARCHAR(100) NOT NULL
);
```
# 역할.
```sql
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE -- 'ROLE_USER', 'ROLE_HOST' 등
);
```
# 사용자-역할.
```sql
CREATE TABLE user_roles (
    userId BIGINT NOT NULL,
    roleId INT NOT NULL,
    
    PRIMARY KEY (userId, roleId), -- 복합 PK
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (roleId) REFERENCES roles(id)
);
```