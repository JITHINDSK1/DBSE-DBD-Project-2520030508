const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');
const auth = require('./middleware/auth');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// JWT Warning
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not defined in .env. Using fallback secret.');
}

// --- AUTH ROUTES ---
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const [result] = await db.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
    
    const user = { id: result.insertId, name, email };
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_123', { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_123', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/me', auth, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- MALL / FLOORS / SPOTS ROUTES ---
app.get('/api/mall', async (req, res) => {
  try {
    const [lots] = await db.query('SELECT id, name, address FROM lots LIMIT 1');
    if (lots.length === 0) return res.status(404).json({ error: 'Mall not found' });
    res.json(lots[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/floors/summary', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.id, f.name, f.floor_order, f.entry_note, 
             COUNT(s.id) as total_spots, 
             SUM(s.status = 'available') as available_spots,
             SUM(s.status = 'booked') as booked_spots
      FROM floors f
      LEFT JOIN parking_spots s ON f.id = s.floor_id
      GROUP BY f.id
      ORDER BY f.floor_order ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/floors', async (req, res) => {
  try {
    const [floors] = await db.query('SELECT * FROM floors ORDER BY floor_order ASC');
    res.json(floors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/floors/:id/spots', async (req, res) => {
  try {
    const [spots] = await db.query(
      'SELECT id, spot_number, row_label, col_position, status, price_per_hour FROM parking_spots WHERE floor_id = ? ORDER BY row_label ASC, col_position ASC',
      [req.params.id]
    );
    res.json(spots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/spots/:id', async (req, res) => {
  try {
    const [spots] = await db.query(
      `SELECT s.*, f.entry_note 
       FROM parking_spots s 
       JOIN floors f ON s.floor_id = f.id 
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (spots.length === 0) return res.status(404).json({ error: 'Spot not found' });
    const spot = spots[0];
    try {
      spot.directions_note = JSON.parse(spot.directions_note);
    } catch(e) {}
    res.json(spot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- BOOKING ROUTES ---
app.post('/api/bookings', auth, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { spotId, hours } = req.body;
    
    const [spots] = await connection.query('SELECT * FROM parking_spots WHERE id = ? FOR UPDATE', [spotId]);
    if (spots.length === 0) throw new Error('Spot not found');
    const spot = spots[0];
    
    if (spot.status !== 'available') {
      await connection.rollback();
      return res.status(400).json({ error: 'Spot no longer available' });
    }
    
    await connection.query('UPDATE parking_spots SET status = ? WHERE id = ?', ['booked', spot.id]);
    
    const total = spot.price_per_hour * Number(hours);
    const bookingRef = 'NX-' + new Date().toISOString().slice(0,10).replace(/-/g, '') + '-' + Math.floor(Math.random()*10000);
    const [result] = await connection.query(
      'INSERT INTO bookings (user_id, spot_id, hours, price_per_hour, total, booking_reference, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, spot.id, hours, spot.price_per_hour, total, bookingRef, 'confirmed']
    );
    
    await connection.commit();
    res.json({ id: result.insertId, status: 'confirmed' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(err.message === 'Spot not found' ? 404 : 500).json({ error: err.message || 'Server error' });
  } finally {
    connection.release();
  }
});

app.post('/api/bookings/auto', auth, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { floorId, hours, vehicleType, isEv, isAccessible } = req.body;
    
    // Deterministic selection algorithm
    // 1. Available
    // 2. Floor match
    // 3. (Optional filters for ev, accessible) - for simplicity we just order by priority_score
    // We could add `AND is_ev = true` if isEv is provided
    
    let query = 'SELECT * FROM parking_spots WHERE floor_id = ? AND status = "available"';
    const params = [floorId];
    
    if (isEv) {
        query += ' AND is_ev = true';
    }
    if (isAccessible) {
        query += ' AND is_accessible = true';
    }
    
    query += ' ORDER BY priority_score ASC LIMIT 1 FOR UPDATE';
    
    const [spots] = await connection.query(query, params);
    
    if (spots.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'No compatible spots available on this level.' });
    }
    
    const spot = spots[0];
    
    await connection.query('UPDATE parking_spots SET status = ? WHERE id = ?', ['booked', spot.id]);
    
    const total = spot.price_per_hour * Number(hours);
    const bookingRef = 'NX-' + new Date().toISOString().slice(0,10).replace(/-/g, '') + '-' + Math.floor(Math.random()*10000);
    const [result] = await connection.query(
      'INSERT INTO bookings (user_id, spot_id, hours, price_per_hour, total, booking_reference, vehicle_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, spot.id, hours, spot.price_per_hour, total, bookingRef, vehicleType || 'My Car', 'confirmed']
    );
    
    await connection.commit();
    res.json({ 
        success: true,
        booking: {
            id: result.insertId,
            spot_id: spot.id,
            spot_number: spot.spot_number,
            status: 'confirmed'
        }
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error during auto booking transaction' });
  } finally {
    connection.release();
  }
});

app.get('/api/bookings', auth, async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.id as _id, b.hours, b.total as totalPrice, b.status, b.created_at as startTime, b.booking_reference,
              s.spot_number, f.name as floor_name
       FROM bookings b
       JOIN parking_spots s ON b.spot_id = s.id
       JOIN floors f ON s.floor_id = f.id
       WHERE b.user_id = ? ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/bookings/:id', auth, async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.id as _id, b.hours, b.total as totalPrice, b.status, b.created_at as startTime, b.booking_reference, b.vehicle_type,
              s.spot_number, s.directions_note, s.row_label, f.name as floor_name
       FROM bookings b
       JOIN parking_spots s ON b.spot_id = s.id
       JOIN floors f ON s.floor_id = f.id
       WHERE b.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found' });
    
    const booking = bookings[0];
    try {
      booking.directions_note = JSON.parse(booking.directions_note);
    } catch(e) {}
    
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/bookings/:id/cancel', auth, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [bookings] = await connection.query('SELECT * FROM bookings WHERE id = ? AND user_id = ? FOR UPDATE', [req.params.id, req.user.id]);
    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookings[0];
    if (booking.status === 'cancelled') {
      await connection.rollback();
      return res.status(400).json({ error: 'Already cancelled' });
    }
    
    await connection.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', booking.id]);
    await connection.query('UPDATE parking_spots SET status = ? WHERE id = ?', ['available', booking.spot_id]);
    
    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

// --- ADMIN / PROVIDER ROUTES (Low Priority) ---
// We can leave some generic lot management for future if needed, but since it's a single mall, we'll keep it minimal.
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
