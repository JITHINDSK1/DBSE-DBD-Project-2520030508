# Forum Sujana Mall Parking Management System

A normalized, relational database management system (DBSE) project built with React, Node.js, and MySQL. 

## Project Architecture & Context

This project simulates the parking infrastructure of **Forum Sujana Mall (Kukatpally, Hyderabad)**. 
- **Developer:** Phoenix Group
- **Operator:** Forum Corporate Pvt Ltd
- **Capacity:** 1400 four-wheeler & 1550 two-wheeler slots.
- **Entry/Exit Gates:** 4

*Note: While the overall mall capacity and floor structures (Lower Ground, Upper Ground) are factual based on the supplied project PDF, the individual parking zones (e.g., LG-A), spot numbers, and live occupancy states are **simulated for academic demonstration** as the source material does not provide a verified numbered parking-bay layout.*

## Technology Stack
- **Database:** MySQL 8.0 (Primary Source of Truth)
- **Backend:** Node.js, Express, `mysql2` driver
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons

## Database Schema (forum_mall_parking)

The database is fully normalized to 3NF. It contains the following tables:
1. `malls` - Mall metadata and capacities
2. `floors` - Floor hierarchy linked to mall
3. `parking_zones` - Logical grouping of spots per floor
4. `parking_spots` - Individual addressable parking spaces (e.g., `LG-A-01`)
5. `users` - Platform users (USER, ADMIN, PROVIDER roles)
6. `vehicles` - Registered user vehicles
7. `bookings` - Reservation records
8. `parking_sessions` - Physical entry/exit records
9. `entry_gates` - Access control points
10. `parking_sensors` - IoT sensor metadata for simulation
11. `payments` - Transaction records
12. `notifications` - User alerts

## DBSE Features Implemented

This project extensively uses advanced MySQL features:

### 1. Database Transactions with `SELECT ... FOR UPDATE`
To prevent concurrent double-booking of a single parking spot, the booking API opens a MySQL Transaction and uses a row-level lock (`SELECT status FROM parking_spots WHERE id = ? FOR UPDATE`). If the spot is `AVAILABLE`, the booking proceeds and the transaction is `COMMIT`ted. Otherwise, it is `ROLLBACK`ed.

### 2. SQL Triggers
- `after_booking_insert`: Automatically changes the `parking_spots.status` to `RESERVED` when a new `UPCOMING` booking is created.
- `after_booking_update`: Automatically changes the `parking_spots.status` to `AVAILABLE` when a booking is cancelled or completed.

### 3. SQL Views
- `available_parking_spots`: A denormalized view joining spots, zones, and floors for fast availability lookups.
- `parking_occupancy_summary`: A grouped view calculating total, available, occupied, and reserved spots per zone, along with occupancy percentages.
- `active_bookings`: A unified view of current bookings and user details.

### 4. Stored Procedures
- `book_parking_spot`: A pure SQL procedure demonstrating how booking logic and transactions can be handled entirely at the database layer.
- `get_floor_occupancy`: Calculates zone-level metrics for a specific floor.

### 5. Constraints & Indexes
- Primary keys and Foreign keys on all relational boundaries.
- `UNIQUE` constraints on emails, vehicle registrations, and spot codes.
- `ENUM` constraints to prevent invalid statuses (e.g., `status ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')`).
- Indexes on frequently searched columns like `status` and `user_id`.

## How to Run

### 1. Database Setup
Ensure MySQL is running on port 3306.
Run the initialization script:
```bash
mysql -u root -proot < init_forum_mall.sql
```

### 2. Backend
Navigate to `/backend`:
```bash
npm install
npm run dev
```

### 3. Frontend
Navigate to `/frontend`:
```bash
npm install
npm run dev
```

### User Roles
- **Admin**: `admin@parkfinder.com` (password: `password`)
- **Demo User**: `demo@parkfinder.com` (password: `password`)