const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get Dashboard Analytics (Uses Views)
router.get('/dashboard', auth, requireRole(['ADMIN', 'PROVIDER']), async (req, res) => {
    try {
        // Query the View: parking_occupancy_summary
        const [occupancy] = await db.query('SELECT * FROM parking_occupancy_summary');
        
        // Count of active bookings
        const [activeBookings] = await db.query('SELECT COUNT(*) as count FROM active_bookings');
        
        // Revenue (simplified, based on completed/active bookings today)
        const [revenue] = await db.query("SELECT SUM(amount) as total FROM bookings WHERE status IN ('ACTIVE', 'COMPLETED') AND DATE(created_at) = CURRENT_DATE()");

        res.json({
            occupancy,
            active_bookings: activeBookings[0].count,
            revenue_today: revenue[0].total || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// SIMULATION: Manually update spot status
router.post('/simulate/spot', auth, requireRole(['ADMIN']), async (req, res) => {
    try {
        const { spot_id, new_status } = req.body;
        
        if (!['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].includes(new_status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        await db.query('UPDATE parking_spots SET status = ? WHERE id = ?', [new_status, spot_id]);
        
        res.json({ success: true, message: `Spot ${spot_id} updated to ${new_status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Get all bookings
router.get('/bookings', auth, requireRole(['ADMIN', 'PROVIDER']), async (req, res) => {
    try {
        const [bookings] = await db.query(
            `SELECT b.*, u.name as user_name, u.email as user_email, ps.spot_code 
             FROM bookings b 
             JOIN users u ON b.user_id = u.id 
             JOIN parking_spots ps ON b.spot_id = ps.id
             ORDER BY b.created_at DESC`
        );
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
