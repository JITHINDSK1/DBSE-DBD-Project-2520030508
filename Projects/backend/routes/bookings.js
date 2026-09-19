const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET my bookings
router.get('/me', auth, async (req, res) => {
    try {
        const [bookings] = await db.query(
            `SELECT b.*, ps.spot_code, pz.zone_name, f.name as floor_name, v.registration_number
             FROM bookings b
             JOIN parking_spots ps ON b.spot_id = ps.id
             JOIN parking_zones pz ON ps.zone_id = pz.id
             JOIN floors f ON pz.floor_id = f.id
             JOIN vehicles v ON b.vehicle_id = v.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`, 
            [req.user.id]
        );
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST a new booking
router.post('/', auth, async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { spot_id, vehicle_id, start_time, end_time, amount } = req.body;
        
        await connection.beginTransaction();
        
        // Use DBSE feature: SELECT ... FOR UPDATE
        const [spots] = await connection.query('SELECT status FROM parking_spots WHERE id = ? FOR UPDATE', [spot_id]);
        
        if (spots.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Spot not found' });
        }
        
        if (spots[0].status !== 'AVAILABLE') {
            await connection.rollback();
            return res.status(400).json({ error: 'Spot is not available for booking' });
        }
        
        // Generate booking reference
        const bookingRef = 'FS-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(Math.random() * 10000);
        
        const [result] = await connection.query(
            'INSERT INTO bookings (user_id, vehicle_id, spot_id, booking_reference, start_time, end_time, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, vehicle_id, spot_id, bookingRef, new Date(start_time), new Date(end_time), amount, 'UPCOMING']
        );
        
        // The trigger will automatically update the spot status to RESERVED
        
        await connection.commit();
        res.json({ success: true, booking_id: result.insertId, booking_reference: bookingRef });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Server error during booking transaction' });
    } finally {
        connection.release();
    }
});

// CANCEL a booking
router.patch('/:id/cancel', auth, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const [bookings] = await connection.query('SELECT * FROM bookings WHERE id = ? AND user_id = ? FOR UPDATE', [req.params.id, req.user.id]);
        
        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        if (bookings[0].status !== 'UPCOMING' && bookings[0].status !== 'ACTIVE') {
            await connection.rollback();
            return res.status(400).json({ error: 'Cannot cancel a booking in this state' });
        }
        
        await connection.query('UPDATE bookings SET status = ?, cancelled_at = ? WHERE id = ?', ['CANCELLED', new Date(), req.params.id]);
        
        // Trigger will automatically update the spot status back to AVAILABLE
        
        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Server error during cancellation' });
    } finally {
        connection.release();
    }
});

module.exports = router;
