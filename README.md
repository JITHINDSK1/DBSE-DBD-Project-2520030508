## Database
MongoDB Atlas, db name: parkfinder
3 collections: users, parkings, bookings

## Run
1. copy .env.example → .env
2. npm install
3. npm run seed
4. npm run dev

## Booking rule
availableSlots is the source of truth.
Book = decrement. Cancel = increment.