CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE listings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hostId BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    guestCapacity INT NOT NULL DEFAULT 1,
    infantCapacity INT NOT NULL DEFAULT 0,
    address VARCHAR(255),
    FOREIGN KEY (hostId) REFERENCES users(id),
    INDEX IDX_capacity (guestCapacity, infantCapacity)
);

CREATE TABLE listing_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    listingId BIGINT NOT NULL,
    date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    isAvailable BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listingId) REFERENCES listings(id) ON DELETE CASCADE,
    INDEX IDX_search (date, isAvailable, price, listingId)
);
