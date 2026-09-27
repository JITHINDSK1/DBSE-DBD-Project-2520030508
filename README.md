# ParkFinder

## Overview
ParkFinder is a sleek web application for finding and booking parking spots in Hyderabad.

## Tech Stack
- Frontend: React (Vite), plain CSS
- Backend: Node.js, Express.js

## Backend & Database
The backend is completely simple and uses an Express server on port 5000.
**Note: This demo uses in-memory data.** It does not use MongoDB or require any `.env` configuration. All 19 Hyderabad parking locations are pre-loaded in memory.

### Booking rules:
- `availableSlots` is the source of truth.
- Book = decrement slots. Cancel = increment slots.

## How to Run

You only need two commands:

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```