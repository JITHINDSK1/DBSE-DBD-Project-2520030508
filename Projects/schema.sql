CREATE DATABASE IF NOT EXISTS parkfinder;
USE parkfinder;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    slots INT NOT NULL,
    price_per_hour DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lot_id INT NOT NULL,
    lot_name VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    hours INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('confirmed','cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lot_id) REFERENCES lots(id)
);

-- Seed Data for existing lots
INSERT INTO lots (name, area, slots, price_per_hour) VALUES
('Inorbit Mall Parking', 'Madhapur', 42, 50.00),
('GVK One Garage', 'Banjara Hills', 15, 80.00),
('Hitech City Metro Station', 'Hitech City', 110, 30.00),
('Sarath City Capital Mall', 'Kondapur', 5, 60.00),
('Forum Sujana Mall', 'Kukatpally', 28, 40.00),
('Raidurg Metro Parking', 'HITEC City', 65, 30.00),
('Atrium Mall Basement', 'Gachibowli', 22, 50.00),
('Manjeera Mall Parking', 'Kukatpally', 18, 40.00),
('Prasad IMAX Parking', 'Necklace Road', 34, 40.00),
('Nampally Automated MLP', 'Nampally', 48, 35.00),
('DLF Cyber City Parking', 'Gachibowli', 55, 40.00),
('Western Aqua Basement', 'Kondapur', 19, 50.00),
('Krishe Sapphire Parking', 'Madhapur', 24, 45.00),
('Cyber Pearl Parking', 'HITEC City', 38, 40.00),
('Shilparamam Parking', 'HITEC City', 80, 30.00),
('Miyapur Metro Parking', 'Miyapur', 95, 30.00),
('IKEA External Parking', 'Gachibowli', 140, 40.00),
('AMB Cinemas Whitefields', 'Kondapur', 21, 50.00),
('Somajiguda Smart Parking', 'Somajiguda', 33, 25.00);
