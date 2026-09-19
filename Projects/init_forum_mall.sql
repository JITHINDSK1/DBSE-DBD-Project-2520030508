-- DBSE Project: Forum Sujana Mall Parking Management System
-- Database Creation & Schema Definition

CREATE DATABASE IF NOT EXISTS forum_mall_parking;
USE forum_mall_parking;

-- ==================================================
-- 1. TABLES
-- ==================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN', 'PROVIDER') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS malls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    developer VARCHAR(255),
    operator VARCHAR(255),
    four_wheeler_capacity INT NOT NULL,
    two_wheeler_capacity INT NOT NULL,
    entry_exit_count INT,
    weekday_footfall INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS floors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mall_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    display_order INT,
    floor_type ENUM('LOWER_GROUND', 'UPPER_GROUND', 'RETAIL', 'PARKING') NOT NULL,
    FOREIGN KEY (mall_id) REFERENCES malls(id)
);

CREATE TABLE IF NOT EXISTS parking_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    floor_id INT NOT NULL,
    zone_code VARCHAR(50) NOT NULL,
    zone_name VARCHAR(100),
    description TEXT,
    FOREIGN KEY (floor_id) REFERENCES floors(id)
);

CREATE TABLE IF NOT EXISTS parking_spots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT NOT NULL,
    spot_code VARCHAR(50) NOT NULL UNIQUE,
    spot_type ENUM('CAR', 'BIKE', 'SUV', 'EV', 'ACCESSIBLE') NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE') DEFAULT 'AVAILABLE',
    is_reserved BOOLEAN DEFAULT FALSE,
    is_ev BOOLEAN DEFAULT FALSE,
    is_disabled BOOLEAN DEFAULT FALSE,
    spot_row INT,
    spot_column INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES parking_zones(id)
);

CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_type ENUM('CAR', 'BIKE', 'SUV') NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    spot_id INT NOT NULL,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED') DEFAULT 'UPCOMING',
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (spot_id) REFERENCES parking_spots(id)
);

CREATE TABLE IF NOT EXISTS parking_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    spot_id INT NOT NULL,
    entry_time DATETIME NOT NULL,
    exit_time DATETIME NULL,
    duration_minutes INT,
    amount DECIMAL(10, 2),
    payment_status ENUM('PENDING', 'PAID', 'REFUNDED') DEFAULT 'PENDING',
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (spot_id) REFERENCES parking_spots(id)
);

CREATE TABLE IF NOT EXISTS entry_gates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mall_id INT NOT NULL,
    gate_code VARCHAR(50) NOT NULL UNIQUE,
    gate_name VARCHAR(100),
    gate_type ENUM('ENTRY', 'EXIT', 'BOTH') NOT NULL,
    status ENUM('OPEN', 'CLOSED', 'MAINTENANCE') DEFAULT 'OPEN',
    FOREIGN KEY (mall_id) REFERENCES malls(id)
);

CREATE TABLE IF NOT EXISTS parking_sensors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spot_id INT NOT NULL UNIQUE,
    sensor_code VARCHAR(50) NOT NULL UNIQUE,
    sensor_status ENUM('ONLINE', 'OFFLINE', 'FAULTY') DEFAULT 'ONLINE',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spot_id) REFERENCES parking_spots(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CREDIT_CARD', 'UPI', 'CASH', 'WALLET') NOT NULL,
    transaction_reference VARCHAR(255),
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    paid_at DATETIME NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT,
    message TEXT NOT NULL,
    type ENUM('INFO', 'WARNING', 'ALERT', 'SUCCESS') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- ==================================================
-- 2. INDEXES
-- ==================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_parking_spots_code ON parking_spots(spot_code);
CREATE INDEX idx_parking_spots_status ON parking_spots(status);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_spot ON bookings(spot_id);
CREATE INDEX idx_bookings_time ON bookings(start_time, end_time);
CREATE INDEX idx_parking_zones_floor ON parking_zones(floor_id);

-- ==================================================
-- 3. SEED DATA
-- ==================================================

INSERT INTO malls (name, location, developer, operator, four_wheeler_capacity, two_wheeler_capacity, entry_exit_count, weekday_footfall)
VALUES (
    'Forum Sujana Mall', 
    'Kukatpally, Hyderabad', 
    'Phoenix Group', 
    'Forum Corporate Pvt Ltd', 
    1400, 
    1550, 
    4, 
    23000
);

-- We only map parking floors for the interactive demo, and one retail floor as context.
INSERT INTO floors (mall_id, name, display_order, floor_type) VALUES 
(1, 'Lower Ground', 1, 'PARKING'),
(1, 'Upper Ground', 2, 'RETAIL');

INSERT INTO parking_zones (floor_id, zone_code, zone_name, description) VALUES
(1, 'LG-A', 'Lower Ground Zone A', 'Simulation Zone A'),
(1, 'LG-B', 'Lower Ground Zone B', 'Simulation Zone B');

-- Seed 10 spots for Zone A
INSERT INTO parking_spots (zone_id, spot_code, spot_type, status, spot_row, spot_column, is_ev, is_disabled) VALUES
(1, 'LG-A-01', 'CAR', 'AVAILABLE', 1, 1, FALSE, TRUE),
(1, 'LG-A-02', 'CAR', 'AVAILABLE', 1, 2, FALSE, FALSE),
(1, 'LG-A-03', 'CAR', 'OCCUPIED', 1, 3, FALSE, FALSE),
(1, 'LG-A-04', 'CAR', 'AVAILABLE', 1, 4, FALSE, FALSE),
(1, 'LG-A-05', 'CAR', 'AVAILABLE', 1, 5, TRUE, FALSE),
(1, 'LG-A-06', 'CAR', 'RESERVED', 2, 1, FALSE, FALSE),
(1, 'LG-A-07', 'CAR', 'AVAILABLE', 2, 2, FALSE, FALSE),
(1, 'LG-A-08', 'CAR', 'AVAILABLE', 2, 3, FALSE, FALSE),
(1, 'LG-A-09', 'BIKE', 'AVAILABLE', 2, 4, FALSE, FALSE),
(1, 'LG-A-10', 'BIKE', 'OCCUPIED', 2, 5, FALSE, FALSE);

-- Seed 10 spots for Zone B
INSERT INTO parking_spots (zone_id, spot_code, spot_type, status, spot_row, spot_column) VALUES
(2, 'LG-B-01', 'CAR', 'AVAILABLE', 1, 1),
(2, 'LG-B-02', 'CAR', 'AVAILABLE', 1, 2),
(2, 'LG-B-03', 'CAR', 'AVAILABLE', 1, 3),
(2, 'LG-B-04', 'CAR', 'MAINTENANCE', 1, 4),
(2, 'LG-B-05', 'CAR', 'AVAILABLE', 1, 5),
(2, 'LG-B-06', 'CAR', 'AVAILABLE', 2, 1),
(2, 'LG-B-07', 'CAR', 'AVAILABLE', 2, 2),
(2, 'LG-B-08', 'CAR', 'AVAILABLE', 2, 3),
(2, 'LG-B-09', 'BIKE', 'AVAILABLE', 2, 4),
(2, 'LG-B-10', 'BIKE', 'AVAILABLE', 2, 5);

INSERT INTO entry_gates (mall_id, gate_code, gate_name, gate_type, status) VALUES 
(1, 'GATE-1', 'Main Entry', 'ENTRY', 'OPEN'),
(1, 'GATE-2', 'Main Exit', 'EXIT', 'OPEN'),
(1, 'GATE-3', 'Rear Entry', 'ENTRY', 'OPEN'),
(1, 'GATE-4', 'Rear Exit', 'EXIT', 'OPEN');

-- Dummy User (password is 'password' hashed with bcrypt)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@parkfinder.com', '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbegNERk8pzOUpSV5q.pC', 'ADMIN'),
('Provider User', 'provider@parkfinder.com', '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbegNERk8pzOUpSV5q.pC', 'PROVIDER'),
('Demo User', 'demo@parkfinder.com', '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbegNERk8pzOUpSV5q.pC', 'USER');

INSERT INTO vehicles (user_id, registration_number, vehicle_type, make) VALUES 
(3, 'TS09EX1234', 'CAR', 'Hyundai');

-- ==================================================
-- 4. DBSE FEATURES: VIEWS
-- ==================================================

-- View: available_parking_spots
CREATE OR REPLACE VIEW available_parking_spots AS
SELECT 
    ps.id as spot_id, ps.spot_code, ps.spot_type, ps.status, ps.is_ev, ps.is_disabled,
    pz.zone_code, pz.zone_name,
    f.name as floor_name, f.id as floor_id
FROM parking_spots ps
JOIN parking_zones pz ON ps.zone_id = pz.id
JOIN floors f ON pz.floor_id = f.id
WHERE ps.status = 'AVAILABLE';

-- View: parking_occupancy_summary
CREATE OR REPLACE VIEW parking_occupancy_summary AS
SELECT 
    f.name as floor_name,
    pz.zone_name,
    COUNT(ps.id) as total_spots,
    SUM(CASE WHEN ps.status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_spots,
    SUM(CASE WHEN ps.status = 'OCCUPIED' THEN 1 ELSE 0 END) as occupied_spots,
    SUM(CASE WHEN ps.status = 'RESERVED' THEN 1 ELSE 0 END) as reserved_spots,
    SUM(CASE WHEN ps.status = 'MAINTENANCE' THEN 1 ELSE 0 END) as maintenance_spots,
    (SUM(CASE WHEN ps.status = 'OCCUPIED' THEN 1 ELSE 0 END) / COUNT(ps.id)) * 100 as occupancy_percentage
FROM floors f
JOIN parking_zones pz ON f.id = pz.floor_id
JOIN parking_spots ps ON pz.id = ps.zone_id
GROUP BY f.id, pz.id;

-- View: active_bookings
CREATE OR REPLACE VIEW active_bookings AS
SELECT 
    b.id as booking_id, b.booking_reference, b.start_time, b.end_time, b.status as booking_status,
    u.name as user_name, u.email as user_email,
    v.registration_number, v.vehicle_type,
    ps.spot_code, ps.status as spot_status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN vehicles v ON b.vehicle_id = v.id
JOIN parking_spots ps ON b.spot_id = ps.id
WHERE b.status IN ('UPCOMING', 'ACTIVE');

-- ==================================================
-- 5. DBSE FEATURES: TRIGGERS
-- ==================================================

DELIMITER $$

-- Trigger: Automatically update spot to RESERVED after a new UPCOMING booking
CREATE TRIGGER after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'UPCOMING' THEN
        UPDATE parking_spots SET status = 'RESERVED', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.spot_id;
    END IF;
END$$

-- Trigger: Automatically update spot to AVAILABLE when booking is cancelled or completed
CREATE TRIGGER after_booking_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF (NEW.status = 'CANCELLED' OR NEW.status = 'COMPLETED') AND OLD.status NOT IN ('CANCELLED', 'COMPLETED') THEN
        UPDATE parking_spots SET status = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.spot_id;
    END IF;
    
    IF NEW.status = 'ACTIVE' AND OLD.status = 'UPCOMING' THEN
        UPDATE parking_spots SET status = 'OCCUPIED', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.spot_id;
    END IF;
END$$

DELIMITER ;

-- ==================================================
-- 6. DBSE FEATURES: STORED PROCEDURES
-- ==================================================

DELIMITER $$

-- Procedure: book_parking_spot (Uses Transactions)
CREATE PROCEDURE book_parking_spot(
    IN p_user_id INT,
    IN p_spot_id INT,
    IN p_vehicle_id INT,
    IN p_start_time DATETIME,
    IN p_end_time DATETIME,
    IN p_amount DECIMAL(10, 2),
    OUT p_booking_id INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_status VARCHAR(50);
    DECLARE v_booking_ref VARCHAR(50);
    
    -- Error handler for rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_message = 'Booking failed due to an internal error.';
        SET p_booking_id = -1;
    END;

    START TRANSACTION;

    -- SELECT FOR UPDATE to lock the row and prevent concurrent double-booking
    SELECT status INTO v_status 
    FROM parking_spots 
    WHERE id = p_spot_id 
    FOR UPDATE;

    IF v_status = 'AVAILABLE' THEN
        -- Generate Booking Reference
        SET v_booking_ref = CONCAT('FS-', DATE_FORMAT(CURRENT_DATE(), '%Y%m%d'), '-', FLOOR(RAND() * 10000));
        
        -- Insert Booking
        INSERT INTO bookings (user_id, vehicle_id, spot_id, booking_reference, start_time, end_time, amount, status)
        VALUES (p_user_id, p_vehicle_id, p_spot_id, v_booking_ref, p_start_time, p_end_time, p_amount, 'UPCOMING');
        
        SET p_booking_id = LAST_INSERT_ID();
        SET p_message = 'Booking successful.';
        
        -- Note: Trigger 'after_booking_insert' will automatically set spot status to RESERVED
        
        COMMIT;
    ELSE
        ROLLBACK;
        SET p_message = CONCAT('Spot is not available. Current status: ', v_status);
        SET p_booking_id = -1;
    END IF;
END$$

-- Procedure: get_floor_occupancy
CREATE PROCEDURE get_floor_occupancy(IN p_floor_id INT)
BEGIN
    SELECT 
        pz.zone_name,
        COUNT(ps.id) as total_spots,
        SUM(CASE WHEN ps.status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_spots,
        SUM(CASE WHEN ps.status = 'OCCUPIED' THEN 1 ELSE 0 END) as occupied_spots
    FROM parking_zones pz
    JOIN parking_spots ps ON pz.id = ps.zone_id
    WHERE pz.floor_id = p_floor_id
    GROUP BY pz.id;
END$$

DELIMITER ;
