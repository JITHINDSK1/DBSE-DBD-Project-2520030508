const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all malls
router.get('/', async (req, res) => {
    try {
        const [malls] = await db.query('SELECT * FROM malls');
        res.json(malls);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET single mall by ID with occupancy summary
router.get('/:id', async (req, res) => {
    try {
        const [malls] = await db.query('SELECT * FROM malls WHERE id = ?', [req.params.id]);
        if (malls.length === 0) return res.status(404).json({ error: 'Mall not found' });
        
        // Get aggregated stats from view
        const [occupancy] = await db.query(
            `SELECT 
                SUM(total_spots) as total,
                SUM(available_spots) as available,
                SUM(occupied_spots) as occupied,
                SUM(reserved_spots) as reserved,
                SUM(maintenance_spots) as maintenance
             FROM parking_occupancy_summary`
        );
        
        res.json({
            ...malls[0],
            stats: occupancy[0] || { total: 0, available: 0, occupied: 0, reserved: 0, maintenance: 0 }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
