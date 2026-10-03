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

// --- AUTH ROUTES ---

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userRole = role === 'PROVIDER' ? 'PROVIDER' : 'USER';
    
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const [result] = await db.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, hash, userRole]);
    
    const user = { id: result.insertId, name, email, role: userRole };
    const token = jwt.sign({ id: user.id, role: userRole }, process.env.JWT_SECRET || 'nexus_mall_super_secret_key_9999', { expiresIn: '7d' });
    
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

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'nexus_mall_super_secret_key_9999', { expiresIn: '7d' });
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/me', auth, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- PARKINGS/LOTS ROUTES ---

app.get('/api/parkings', async (req, res) => {
  try {
    const query = `
      SELECT p.*, 
             (SELECT COUNT(*) FROM parking_spots s 
              JOIN parking_zones z ON s.zone_id = z.id
              JOIN floors f ON z.floor_id = f.id
              WHERE f.lot_id = p.id AND s.is_available = true) as availableSlots
      FROM parking_lots p
    `;
    const [lots] = await db.query(query);
    const mapped = lots.map(l => ({
      _id: l.id,
      name: l.name,
      area: l.location,
      city: 'Hyderabad',
      availableSlots: l.availableSlots || l.capacity, // Fallback to capacity if no spots exist
      pricePerHour: l.price_per_hour
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/parkings/:id', async (req, res) => {
  try {
    const [lots] = await db.query('SELECT * FROM parking_lots WHERE id = ?', [req.params.id]);
    if (lots.length === 0) return res.status(404).json({ error: 'Not found' });
    const l = lots[0];
    
    // Get floors/zones/spots
    const [floors] = await db.query('SELECT * FROM floors WHERE lot_id = ? ORDER BY level', [l.id]);
    for (let floor of floors) {
      const [zones] = await db.query('SELECT * FROM parking_zones WHERE floor_id = ?', [floor.id]);
      for (let zone of zones) {
        const [spots] = await db.query('SELECT * FROM parking_spots WHERE zone_id = ?', [zone.id]);
        zone.spots = spots;
      }
      floor.zones = zones;
    }

    res.json({
      _id: l.id, name: l.name, area: l.location, description: l.description,
      capacity: l.capacity, pricePerHour: l.price_per_hour, floors
    });
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
    
    const { parkingId, lotId, hours, spotId } = req.body;
    const actualLotId = parkingId || lotId;
    
    // Auto-assign spot if none provided
    let assignedSpotId = spotId;
    if (!assignedSpotId) {
      const [spots] = await connection.query(`
        SELECT s.id FROM parking_spots s
        JOIN parking_zones z ON s.zone_id = z.id
        JOIN floors f ON z.floor_id = f.id
        WHERE f.lot_id = ? AND s.is_available = true LIMIT 1 FOR UPDATE
      `, [actualLotId]);
      
      if (spots.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'No spots available' });
      }
      assignedSpotId = spots[0].id;
    }

    // Verify spot
    const [spotCheck] = await connection.query('SELECT is_available FROM parking_spots WHERE id = ? FOR UPDATE', [assignedSpotId]);
    if (spotCheck.length === 0 || !spotCheck[0].is_available) {
      await connection.rollback();
      return res.status(400).json({ error: 'Spot is not available' });
    }
    
    // Get lot details
    const [lots] = await connection.query('SELECT * FROM parking_lots WHERE id = ?', [actualLotId]);
    const lot = lots[0];

    // Mark spot unavailable
    await connection.query('UPDATE parking_spots SET is_available = false WHERE id = ?', [assignedSpotId]);
    
    const total = lot.price_per_hour * Number(hours);
    const ref = 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const [result] = await connection.query(
      'INSERT INTO bookings (user_id, spot_id, reference, start_time, hours, total_price, status) VALUES (?, ?, ?, NOW(), ?, ?, ?)',
      [req.user.id, assignedSpotId, ref, hours, total, 'confirmed']
    );
    
    await connection.commit();
    res.json({ 
      id: result.insertId, 
      status: 'confirmed', 
      reference: ref,
      parkingName: lot.name,
      location: lot.location,
      area: lot.location
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  } finally {
    connection.release();
  }
});

app.get('/api/bookings/me', auth, async (req, res) => {
  try {
    const query = `
      SELECT b.*, s.name as spot_name, z.name as zone_name, f.name as floor_name, 
             p.name as parkingName, p.id as parkingId, p.location as area
      FROM bookings b
      JOIN parking_spots s ON b.spot_id = s.id
      JOIN parking_zones z ON s.zone_id = z.id
      JOIN floors f ON z.floor_id = f.id
      JOIN parking_lots p ON f.lot_id = p.id
      WHERE b.user_id = ? ORDER BY b.created_at DESC
    `;
    const [bookings] = await db.query(query, [req.user.id]);
    
    const mapped = bookings.map(b => ({
      _id: b.id,
      parkingId: b.parkingId,
      parkingName: b.parkingName,
      area: b.area,
      location: b.area,
      spotName: `${b.floor_name}-${b.zone_name}-${b.spot_name}`,
      reference: b.reference,
      hours: b.hours,
      startTime: b.start_time,
      totalPrice: b.total_price,
      status: b.status
    }));
    res.json(mapped);
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
    await connection.query('UPDATE parking_spots SET is_available = true WHERE id = ?', [booking.spot_id]);
    
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

// --- PROVIDER ROUTES ---

const isProvider = (req, res, next) => {
  if (req.user && (req.user.role === 'PROVIDER' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Provider only.' });
  }
};

app.post('/api/provider/lots', auth, isProvider, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { name, location, description, vehicle_types, capacity, price_per_hour, floorsCount = 1 } = req.body;
    
    const [result] = await connection.query(
      'INSERT INTO parking_lots (name, location, description, vehicle_types, capacity, price_per_hour, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, location, description, vehicle_types, Number(capacity), Number(price_per_hour), req.user.id]
    );
    const lotId = result.insertId;

    // Create default floors, zones, spots based on capacity
    const spotsPerFloor = Math.floor(Number(capacity) / floorsCount);
    
    for(let f=1; f<=floorsCount; f++) {
      const [floorRes] = await connection.query("INSERT INTO floors (lot_id, name, level) VALUES (?, ?, ?)", [lotId, `Level ${f}`, f]);
      const floorId = floorRes.insertId;
      
      const [zoneRes] = await connection.query("INSERT INTO parking_zones (floor_id, name, type) VALUES (?, 'Standard', 'Standard')", [floorId]);
      const zoneId = zoneRes.insertId;
      
      const numSpots = (f === floorsCount) ? (Number(capacity) - (spotsPerFloor * (f-1))) : spotsPerFloor;
      
      let spotValues = [];
      for(let s=1; s<=numSpots; s++) {
        spotValues.push([zoneId, `S${s}`, true]);
      }
      
      if(spotValues.length > 0) {
        await connection.query("INSERT INTO parking_spots (zone_id, name, is_available) VALUES ?", [spotValues]);
      }
    }

    await connection.commit();
    res.json({ id: lotId, name, location, capacity, price_per_hour });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

app.get('/api/provider/lots', auth, isProvider, async (req, res) => {
  try {
    let query = 'SELECT p.*, (SELECT COUNT(*) FROM parking_spots s JOIN parking_zones z ON s.zone_id=z.id JOIN floors f ON z.floor_id=f.id WHERE f.lot_id=p.id AND s.is_available=true) as availableSlots FROM parking_lots p';
    let params = [];
    if (req.user.role !== 'ADMIN') {
      query += ' WHERE p.owner_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY p.id DESC';
    
    const [lots] = await db.query(query, params);
    res.json(lots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/provider/bookings', auth, isProvider, async (req, res) => {
  try {
    let query = `
       SELECT b.*, u.name as user_name, u.email as user_email,
              p.name as parking_name, f.name as floor_name, z.name as zone_name, s.name as spot_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN parking_spots s ON b.spot_id = s.id
       JOIN parking_zones z ON s.zone_id = z.id
       JOIN floors f ON z.floor_id = f.id
       JOIN parking_lots p ON f.lot_id = p.id
    `;
    let params = [];
    if (req.user.role !== 'ADMIN') {
      query += ' WHERE p.owner_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY b.created_at DESC';
    
    const [bookings] = await db.query(query, params);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const deleteLotHandler = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [lots] = await connection.query('SELECT * FROM parking_lots WHERE id = ? FOR UPDATE', [req.params.id]);
    if (lots.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    const lot = lots[0];
    if (req.user.role !== 'ADMIN' && lot.owner_id !== req.user.id) {
      await connection.rollback();
      return res.status(403).json({ error: 'Unauthorized to delete this parking lot' });
    }

    await connection.query('DELETE FROM parking_lots WHERE id = ?', [req.params.id]);
    await connection.commit();
    res.json({ success: true, message: 'Parking lot deleted successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Delete lot error:', err);
    res.status(500).json({ error: 'Failed to delete lot' });
  } finally {
    connection.release();
  }
};

app.delete('/api/provider/lots/:id', auth, isProvider, deleteLotHandler);
app.delete('/api/lots/:id', auth, isProvider, deleteLotHandler);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
