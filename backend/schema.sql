CREATE DATABASE IF NOT EXISTS parkfinder;
USE parkfinder;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS parking_spots;
DROP TABLE IF EXISTS floors;
DROP TABLE IF EXISTS lots;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    owner_id INT NULL
);

CREATE TABLE floors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lot_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    floor_order INT NOT NULL,
    entry_note TEXT,
    FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE
);

CREATE TABLE parking_spots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    floor_id INT NOT NULL,
    spot_number VARCHAR(255) NOT NULL,
    row_label VARCHAR(10) NOT NULL,
    col_position INT NOT NULL,
    status ENUM('available', 'booked') DEFAULT 'available',
    price_per_hour DECIMAL(10, 2) NOT NULL,
    directions_note TEXT,
    spot_type VARCHAR(50) DEFAULT 'compact',
    is_ev BOOLEAN DEFAULT FALSE,
    is_accessible BOOLEAN DEFAULT FALSE,
    priority_score INT DEFAULT 0,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    spot_id INT NOT NULL,
    hours INT NOT NULL,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    booking_reference VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50) DEFAULT 'My Car',
    status ENUM('confirmed','cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (spot_id) REFERENCES parking_spots(id)
);
