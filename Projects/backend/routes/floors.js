const express = require('express');
const db = require('../db');

const router = express.Router();

// GET floors by mall ID
router.get('/mall/:mall_id', async (req, res) => {
    try {
        const [floors] = await db.query('SELECT * FROM floors WHERE mall_id = ? ORDER BY display_order', [req.params.mall_id]);
        res.json(floors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET zones by floor ID
router.get('/:floor_id/zones', async (req, res) => {
    try {
        const [zones] = await db.query('SELECT * FROM parking_zones WHERE floor_id = ?', [req.params.floor_id]);
        res.json(zones);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
