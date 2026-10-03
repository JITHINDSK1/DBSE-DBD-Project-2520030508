# Backend Directory Overview

This directory contains the Node.js / Express backend for the Parkfinder application. It provides RESTful APIs for authentication, viewing parking availability, and booking parking spots, backed by a MySQL database.

## Directory Structure

- **`server.js`**: The main Express server entry point. Sets up middleware (CORS, JSON parsing) and defines all the API routes (auth, floors, parking spots, bookings).
- **`db.js`**: Configures and exports a `mysql2/promise` connection pool to interact with the database.
- **`schema.sql`**: Contains the SQL DDL statements to create the necessary tables (`users`, `lots`, `floors`, `parking_spots`, `bookings`).
- **`seed.js`**: A script to initialize the database with schema and mock data. It creates a test user (`demo@parkfinder.com`), sets up floors for "Nexus Mall", and randomly populates parking spots with a 60-70% occupancy rate.
- **`package.json`**: Lists dependencies (`express`, `mysql2`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`) and npm scripts (`start`, `dev`, `seed`).
- **`middleware/auth.js`**: Express middleware for verifying JSON Web Tokens (JWT) on protected routes.
- **`data.js`**: Contains a static array of parking mall locations in Hyderabad. (Likely a mock data file before the MySQL database was fully integrated).
- **`test-booking.js`**: A test script that simulates user login and exercises the manual and automatic booking APIs.
- **`.env` & `.env.example`**: Environment variables file for database credentials and JWT secret.

## Database Schema (`schema.sql`)

The backend relies on the `parkfinder` database with the following core entities:
1. **`users`**: Stores user authentication data (name, email, password hash).
2. **`lots`**: Represents a parking location (e.g., Nexus Mall).
3. **`floors`**: Represents floors within a lot (e.g., B1, B2).
4. **`parking_spots`**: Defines individual spots on a floor, including status (available/booked), type, price, and exact location grid coordinates.
5. **`bookings`**: Records reservations made by users for specific parking spots.

## API Routes (`server.js`)

### Authentication
- `POST /api/signup`: Register a new user.
- `POST /api/login`: Authenticate and receive a JWT.
- `GET /api/me`: Get the current authenticated user's details.

### Parking Information
- `GET /api/mall`: Get primary mall details.
- `GET /api/floors/summary`: Get a summary of available vs booked spots per floor.
- `GET /api/floors`: List all floors.
- `GET /api/floors/:id/spots`: Get all parking spots on a specific floor.
- `GET /api/spots/:id`: Get details for a specific parking spot.

### Bookings (Protected by JWT)
- `POST /api/bookings`: Book a specific parking spot manually.
- `POST /api/bookings/auto`: Automatically find and book an available spot matching specific criteria (e.g., EV, accessibility).
- `GET /api/bookings`: List all bookings for the logged-in user.
- `GET /api/bookings/:id`: Get specific booking details.
- `PATCH /api/bookings/:id/cancel`: Cancel an active booking and free up the spot.

## Running the Application

Make sure you have your `.env` configured with the correct MySQL credentials.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize Database and Seed Data:**
   ```bash
   npm run seed
   ```
   *Note: Running seed will wipe the database and recreate mock data.*

3. **Start the Server:**
   ```bash
   npm run dev
   ```
   *The server runs on port 5000 by default (using nodemon).*

4. **Test Booking Flow:**
   ```bash
   node test-booking.js
   ```
