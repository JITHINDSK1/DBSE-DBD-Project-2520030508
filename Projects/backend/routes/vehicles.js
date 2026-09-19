const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET all vehicles for a user
router.get('/', auth, async (req, res) => {
    try {
        const [vehicles] = await db.query('SELECT * FROM vehicles WHERE user_id = ?', [req.user.id]);
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ADD a vehicle
router.post('/', auth, async (req, res) => {
    try {
        const { registration_number, vehicle_type, make, model, color } = req.body;
        
        const [existing] = await db.query('SELECT id FROM vehicles WHERE registration_number = ?', [registration_number]);
        if (existing.length > 0) return res.status(400).json({ error: 'Registration number already exists' });

        const [result] = await db.query(
            'INSERT INTO vehicles (user_id, registration_number, vehicle_type, make, model, color) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, registration_number, vehicle_type, make, model, color]
        );
        
        res.json({ id: result.insertId, user_id: req.user.id, registration_number, vehicle_type, make, model, color });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE a vehicle
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.query('DELETE FROM vehicles WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
