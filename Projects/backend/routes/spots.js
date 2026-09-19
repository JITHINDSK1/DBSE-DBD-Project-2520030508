const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET all spots for a zone
router.get('/zone/:zone_id', async (req, res) => {
    try {
        const [spots] = await db.query('SELECT * FROM parking_spots WHERE zone_id = ? ORDER BY spot_row, spot_column', [req.params.zone_id]);
        res.json(spots);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET spot by ID
router.get('/:id', async (req, res) => {
    try {
        const [spots] = await db.query(
            `SELECT ps.*, pz.zone_name, f.name as floor_name 
             FROM parking_spots ps 
             JOIN parking_zones pz ON ps.zone_id = pz.id 
             JOIN floors f ON pz.floor_id = f.id 
             WHERE ps.id = ?`, 
            [req.params.id]
        );
        if (spots.length === 0) return res.status(404).json({ error: 'Spot not found' });
        res.json(spots[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
