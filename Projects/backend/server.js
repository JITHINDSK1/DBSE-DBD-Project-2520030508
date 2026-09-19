const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const mallRoutes = require('./routes/malls');
const floorRoutes = require('./routes/floors');
const spotRoutes = require('./routes/spots');
const bookingRoutes = require('./routes/bookings');
const vehicleRoutes = require('./routes/vehicles');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/malls', mallRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ ok: true, db: 'forum_mall_parking' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
