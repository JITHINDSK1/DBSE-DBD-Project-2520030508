const db = require('./db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function runSeed() {
  let connection;
  try {
    connection = await db.getConnection();
    
    console.log('Running schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (let stmt of statements) {
      await connection.query(stmt);
    }
    
    console.log('Clearing old data...');
    await connection.query('DELETE FROM bookings');
    await connection.query('DELETE FROM parking_spots');
    await connection.query('DELETE FROM floors');
    await connection.query('DELETE FROM lots');
    
    // Check if demo user exists
    const [existing] = await connection.query('SELECT * FROM users WHERE email = ?', ['demo@parkfinder.com']);
    if (existing.length === 0) {
      const hash = await bcrypt.hash('password123', 10);
      await connection.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', ['Demo User', 'demo@parkfinder.com', hash]);
      console.log('Demo user created.');
    }

    console.log('Inserting Nexus Mall...');
    const [lotRes] = await connection.query(
      'INSERT INTO lots (name, address) VALUES (?, ?)',
      ['Nexus Mall', 'Kukatpally, Hyderabad']
    );
    const lotId = lotRes.insertId;

    const floors = [
      { name: 'B1', order: 1, entry_note: 'Take the ramp from Gate 2 down one level' },
      { name: 'B2', order: 2, entry_note: 'Follow the spiral ramp down from B1, stay right' },
      { name: 'B3', order: 3, entry_note: 'Take the express ramp from Gate 4 all the way down' }
    ];

    for (const f of floors) {
      const [floorRes] = await connection.query(
        'INSERT INTO floors (lot_id, name, floor_order, entry_note) VALUES (?, ?, ?, ?)',
        [lotId, f.name, f.order, f.entry_note]
      );
      const floorId = floorRes.insertId;

      console.log(`Generating spots for floor ${f.name}...`);
      const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const spotsPerRow = 18; 
      
      // Random occupancy rate between 60% and 70%
      const floorOccupancy = 0.60 + Math.random() * 0.10;
      
      const spotsParams = [];
      for (const row of rows) {
        for (let col = 1; col <= spotsPerRow; col++) {
          const spotNumber = `${f.name}-${row}${col.toString().padStart(2, '0')}`;
          const status = Math.random() < floorOccupancy ? 'booked' : 'available';
          const price = 40.00;
          const side = col % 2 === 0 ? 'right' : 'left';
          
          // JSON array of short, clear strings
          const directions = JSON.stringify([
            f.entry_note,
            `Head to Row ${row}`,
            `Spot ${col.toString().padStart(2, '0')} is on the ${side} side`
          ]);
          
          const priority_score = (row.charCodeAt(0) - 65) * 100 + col;
          const spot_type = (row === 'A' || row === 'B') ? 'standard' : 'compact';
          const is_ev = (row === 'A');
          const is_accessible = (row === 'A' && col <= 2);

          spotsParams.push([floorId, spotNumber, row, col, status, price, directions, spot_type, is_ev, is_accessible, priority_score]);
        }
      }
      
      // Batch insert using bulk array
      await connection.query(
        'INSERT INTO parking_spots (floor_id, spot_number, row_label, col_position, status, price_per_hour, directions_note, spot_type, is_ev, is_accessible, priority_score) VALUES ?',
        [spotsParams]
      );
    }
    
    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

runSeed();
