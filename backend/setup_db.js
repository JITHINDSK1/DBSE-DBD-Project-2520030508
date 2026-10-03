require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    multipleStatements: true
  });

  try {
    const dbName = process.env.DB_NAME || 'parkfinder';
    console.log(`Ensuring database '${dbName}' exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    console.log('Creating/verifying tables schema...');
    
    // 1. users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('USER', 'PROVIDER', 'ADMIN') DEFAULT 'USER',
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 2. parking_lots
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parking_lots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        vehicle_types VARCHAR(255) DEFAULT 'Car, Bike',
        capacity INT DEFAULT 0,
        price_per_hour DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 3. floors
    await connection.query(`
      CREATE TABLE IF NOT EXISTS floors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lot_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        level INT NOT NULL,
        FOREIGN KEY (lot_id) REFERENCES parking_lots(id) ON DELETE CASCADE
      );
    `);

    // 4. parking_zones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parking_zones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        floor_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        type VARCHAR(50) DEFAULT 'Standard',
        FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
      );
    `);

    // 5. parking_spots
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parking_spots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        zone_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        is_available BOOLEAN DEFAULT true,
        FOREIGN KEY (zone_id) REFERENCES parking_zones(id) ON DELETE CASCADE
      );
    `);

    // 6. vehicles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        registration_number VARCHAR(50) NOT NULL,
        vehicle_type VARCHAR(50) DEFAULT 'Car',
        make VARCHAR(100),
        model VARCHAR(100),
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 7. bookings
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        spot_id INT NOT NULL,
        reference VARCHAR(50) UNIQUE NOT NULL,
        start_time DATETIME NOT NULL,
        hours INT NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        vehicle_plate VARCHAR(50),
        status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (spot_id) REFERENCES parking_spots(id) ON DELETE CASCADE
      );
    `);

    // 8. parking_sessions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parking_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT,
        spot_id INT NOT NULL,
        entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        exit_time DATETIME,
        duration_minutes INT,
        amount DECIMAL(10,2),
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
        FOREIGN KEY (spot_id) REFERENCES parking_spots(id) ON DELETE CASCADE
      );
    `);

    // 9. entry_gates
    await connection.query(`
      CREATE TABLE IF NOT EXISTS entry_gates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lot_id INT NOT NULL,
        gate_code VARCHAR(50) NOT NULL,
        gate_name VARCHAR(100) NOT NULL,
        gate_type ENUM('ENTRY', 'EXIT', 'BIDIRECTIONAL') DEFAULT 'ENTRY',
        status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lot_id) REFERENCES parking_lots(id) ON DELETE CASCADE
      );
    `);

    // 10. parking_sensors
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parking_sensors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        spot_id INT NOT NULL,
        sensor_code VARCHAR(50) NOT NULL,
        sensor_status ENUM('active', 'inactive', 'faulty') DEFAULT 'active',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (spot_id) REFERENCES parking_spots(id) ON DELETE CASCADE
      );
    `);

    // 11. payments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'Card',
        transaction_reference VARCHAR(100),
        payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      );
    `);

    // 12. notifications
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        booking_id INT,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
      );
    `);

    console.log('Verifying providers and users...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    const providerList = [
      { name: 'Admin', email: 'admin@parkfinder.com', role: 'ADMIN' },
      { name: 'Nexus Provider', email: 'provider@nexus.com', role: 'PROVIDER' },
      { name: 'Urban Private Parking Provider', email: 'provider@urbanpark.com', role: 'PROVIDER' },
      { name: 'Tech Park Parking Provider', email: 'provider@techpark.com', role: 'PROVIDER' },
      { name: 'Metro Suburban Parking Provider', email: 'provider@metrosuburban.com', role: 'PROVIDER' },
      { name: 'City Commercial Parking Provider', email: 'provider@citycommercial.com', role: 'PROVIDER' },
      { name: 'Demo User', email: 'user@parkfinder.com', role: 'USER' }
    ];

    for (const p of providerList) {
      await connection.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role)",
        [p.name, p.email, hash, p.role]
      );
    }

    // Map provider emails to IDs
    const [userRows] = await connection.query("SELECT id, email FROM users");
    const userMap = {};
    for (const u of userRows) {
      userMap[u.email] = u.id;
    }

    // Remove legacy generic "Other Parking Lot" if present
    await connection.query("DELETE FROM parking_lots WHERE name = 'Other Parking Lot'");

    console.log('Seeding simulated parking listings across Hyderabad...');

    const simulatedListings = [
      {
        name: 'Nexus Mall',
        email: 'provider@nexus.com',
        location: 'Kukatpally, Hyderabad',
        description: 'Simulated multi-level mall parking with smart sensor guidance and EV charging stations.',
        vehicle_types: 'Car, Bike',
        capacity: 245,
        price_per_hour: 50.00,
        spots_count: 20
      },
      {
        name: 'Cyber Towers Private Parking Space',
        email: 'provider@urbanpark.com',
        location: 'HITEC City, Hyderabad',
        description: 'Simulated private open-air gated parking space 200m from Cyber Towers.',
        vehicle_types: 'Car',
        capacity: 15,
        price_per_hour: 35.00,
        spots_count: 10
      },
      {
        name: 'Inorbit Mall Annexe Parking',
        email: 'provider@citycommercial.com',
        location: 'Madhapur, Hyderabad',
        description: 'Simulated commercial parking lot near Durgam Cheruvu cable bridge.',
        vehicle_types: 'Car, Bike',
        capacity: 120,
        price_per_hour: 50.00,
        spots_count: 15
      },
      {
        name: 'Kondapur Residency Private Driveway',
        email: 'provider@urbanpark.com',
        location: 'Kondapur, Hyderabad',
        description: 'Simulated residential gated driveway parking space.',
        vehicle_types: 'Car, Bike',
        capacity: 8,
        price_per_hour: 25.00,
        spots_count: 8
      },
      {
        name: 'Gachibowli IT Park Office Parking',
        email: 'provider@techpark.com',
        location: 'Gachibowli, Hyderabad',
        description: 'Simulated multi-storey office basement parking near Financial District.',
        vehicle_types: 'Car',
        capacity: 80,
        price_per_hour: 40.00,
        spots_count: 12
      },
      {
        name: 'Banjara Hills Road No 12 Private Slot',
        email: 'provider@urbanpark.com',
        location: 'Banjara Hills, Hyderabad',
        description: 'Simulated secure private parking garage near commercial hub.',
        vehicle_types: 'Car, Bike',
        capacity: 10,
        price_per_hour: 45.00,
        spots_count: 10
      },
      {
        name: 'Jubilee Hills Checkpost Commercial Parking',
        email: 'provider@citycommercial.com',
        location: 'Jubilee Hills, Hyderabad',
        description: 'Simulated paved open parking area for shoppers and visitors.',
        vehicle_types: 'Car, Bike',
        capacity: 40,
        price_per_hour: 60.00,
        spots_count: 12
      },
      {
        name: 'Ameerpet Metro Station Parking Space',
        email: 'provider@metrosuburban.com',
        location: 'Ameerpet, Hyderabad',
        description: 'Simulated commuter parking space next to Ameerpet Interchange Metro.',
        vehicle_types: 'Bike, Car',
        capacity: 150,
        price_per_hour: 30.00,
        spots_count: 15
      },
      {
        name: 'Miyapur Highway Private Parking Lot',
        email: 'provider@metrosuburban.com',
        location: 'Miyapur, Hyderabad',
        description: 'Simulated independent parking compound near Miyapur X Roads.',
        vehicle_types: 'Car, Bike',
        capacity: 50,
        price_per_hour: 25.00,
        spots_count: 10
      },
      {
        name: 'Financial District Executive Tower Parking',
        email: 'provider@techpark.com',
        location: 'Financial District, Hyderabad',
        description: 'Simulated basement parking with RFID barrier gates.',
        vehicle_types: 'Car',
        capacity: 100,
        price_per_hour: 45.00,
        spots_count: 15
      },
      {
        name: 'Kukatpally Housing Board Apartment Parking',
        email: 'provider@urbanpark.com',
        location: 'Kukatpally, Hyderabad',
        description: 'Simulated stilt parking space inside residential gated community.',
        vehicle_types: 'Car, Bike',
        capacity: 12,
        price_per_hour: 20.00,
        spots_count: 10
      },
      {
        name: 'Begumpet Airport Plaza Parking',
        email: 'provider@citycommercial.com',
        location: 'Begumpet, Hyderabad',
        description: 'Simulated open-air commercial parking near Old Airport road.',
        vehicle_types: 'Car, Bike',
        capacity: 60,
        price_per_hour: 35.00,
        spots_count: 12
      },
      {
        name: 'Madhapur Metro Pillar 170 Parking',
        email: 'provider@metrosuburban.com',
        location: 'Madhapur, Hyderabad',
        description: 'Simulated street-adjacent off-road parking bay.',
        vehicle_types: 'Car, Bike',
        capacity: 25,
        price_per_hour: 30.00,
        spots_count: 10
      },
      {
        name: 'Manikonda Green Meadows Private Parking',
        email: 'provider@urbanpark.com',
        location: 'Manikonda, Hyderabad',
        description: 'Simulated private villa compound parking.',
        vehicle_types: 'Car',
        capacity: 6,
        price_per_hour: 25.00,
        spots_count: 6
      },
      {
        name: 'Nallagandla Suburb Open Parking Space',
        email: 'provider@urbanpark.com',
        location: 'Nallagandla, Hyderabad',
        description: 'Simulated open gravel parking ground for residential visitors.',
        vehicle_types: 'Car, Bike',
        capacity: 30,
        price_per_hour: 20.00,
        spots_count: 10
      },
      {
        name: 'Secunderabad Station East Gate Parking',
        email: 'provider@metrosuburban.com',
        location: 'Secunderabad, Hyderabad',
        description: 'Simulated multi-vehicle parking facility near railway station.',
        vehicle_types: 'Car, Bike',
        capacity: 180,
        price_per_hour: 30.00,
        spots_count: 15
      },
      {
        name: 'Dilsukhnagar Shopping Zone Parking',
        email: 'provider@citycommercial.com',
        location: 'Dilsukhnagar, Hyderabad',
        description: 'Simulated multi-storey commercial complex parking.',
        vehicle_types: 'Car, Bike',
        capacity: 75,
        price_per_hour: 35.00,
        spots_count: 12
      },
      {
        name: 'LB Nagar Ring Road Private Garage',
        email: 'provider@metrosuburban.com',
        location: 'LB Nagar, Hyderabad',
        description: 'Simulated covered private garage space for daily/hourly rental.',
        vehicle_types: 'Car',
        capacity: 14,
        price_per_hour: 25.00,
        spots_count: 8
      },
      {
        name: 'Raidurg Tech Zone Underground Parking',
        email: 'provider@techpark.com',
        location: 'Raidurg, Hyderabad',
        description: 'Simulated subterranean parking facility near Mindspace.',
        vehicle_types: 'Car, Bike',
        capacity: 200,
        price_per_hour: 40.00,
        spots_count: 15
      },
      {
        name: 'Somajiguda Business Hub Parking',
        email: 'provider@citycommercial.com',
        location: 'Somajiguda, Hyderabad',
        description: 'Simulated office complex visitor parking lot.',
        vehicle_types: 'Car',
        capacity: 45,
        price_per_hour: 40.00,
        spots_count: 10
      },
      {
        name: 'Hitech City Mindspace Visitor Lot',
        email: 'provider@techpark.com',
        location: 'HITEC City, Hyderabad',
        description: 'Simulated visitor parking zone inside IT park campus.',
        vehicle_types: 'Car, Bike',
        capacity: 110,
        price_per_hour: 45.00,
        spots_count: 15
      },
      {
        name: 'Gachibowli Stadium Sports Complex Parking',
        email: 'provider@citycommercial.com',
        location: 'Gachibowli, Hyderabad',
        description: 'Simulated high-capacity open event parking ground.',
        vehicle_types: 'Car, Bike',
        capacity: 300,
        price_per_hour: 25.00,
        spots_count: 20
      },
      {
        name: 'Kondapur Botanical Garden Road Garage',
        email: 'provider@urbanpark.com',
        location: 'Kondapur, Hyderabad',
        description: 'Simulated private shade-covered parking space.',
        vehicle_types: 'Car',
        capacity: 10,
        price_per_hour: 30.00,
        spots_count: 8
      },
      {
        name: 'Banjara Hills Road No 1 Commercial Plaza',
        email: 'provider@citycommercial.com',
        location: 'Banjara Hills, Hyderabad',
        description: 'Simulated basement valet & self-parking facility.',
        vehicle_types: 'Car',
        capacity: 65,
        price_per_hour: 50.00,
        spots_count: 12
      },
      {
        name: 'Jubilee Hills Road 36 Fashion Street Parking',
        email: 'provider@citycommercial.com',
        location: 'Jubilee Hills, Hyderabad',
        description: 'Simulated shopper parking lot with automated entry gate.',
        vehicle_types: 'Car, Bike',
        capacity: 50,
        price_per_hour: 55.00,
        spots_count: 10
      },
      {
        name: 'Kukatpally Forum Mall Side Lane Parking',
        email: 'provider@urbanpark.com',
        location: 'Kukatpally, Hyderabad',
        description: 'Simulated private paved open lot behind mall.',
        vehicle_types: 'Car, Bike',
        capacity: 20,
        price_per_hour: 30.00,
        spots_count: 10
      },
      {
        name: 'Madhapur Kavuri Hills Residence Driveway',
        email: 'provider@urbanpark.com',
        location: 'Madhapur, Hyderabad',
        description: 'Simulated quiet residential driveway space.',
        vehicle_types: 'Car',
        capacity: 5,
        price_per_hour: 35.00,
        spots_count: 5
      },
      {
        name: 'Hitec City Cyber Gateway Stilt Parking',
        email: 'provider@techpark.com',
        location: 'HITEC City, Hyderabad',
        description: 'Simulated stilt parking level near Cyber Gateway campus.',
        vehicle_types: 'Car, Bike',
        capacity: 90,
        price_per_hour: 40.00,
        spots_count: 12
      },
      {
        name: 'Begumpet Prakash Nagar Private Space',
        email: 'provider@urbanpark.com',
        location: 'Begumpet, Hyderabad',
        description: 'Simulated private residential plot used for daily vehicle storage.',
        vehicle_types: 'Car, Bike',
        capacity: 15,
        price_per_hour: 25.00,
        spots_count: 10
      },
      {
        name: 'Secunderabad Clock Tower Open Parking',
        email: 'provider@metrosuburban.com',
        location: 'Secunderabad, Hyderabad',
        description: 'Simulated public commercial parking square.',
        vehicle_types: 'Car, Bike',
        capacity: 80,
        price_per_hour: 30.00,
        spots_count: 12
      },
      {
        name: 'Dilsukhnagar Metro Depot Parking',
        email: 'provider@metrosuburban.com',
        location: 'Dilsukhnagar, Hyderabad',
        description: 'Simulated transit parking facility for metro passengers.',
        vehicle_types: 'Bike, Car',
        capacity: 140,
        price_per_hour: 25.00,
        spots_count: 15
      },
      {
        name: 'Miyapur Allwyn X Roads Commercial Lot',
        email: 'provider@metrosuburban.com',
        location: 'Miyapur, Hyderabad',
        description: 'Simulated retail store customer parking lot.',
        vehicle_types: 'Car, Bike',
        capacity: 35,
        price_per_hour: 25.00,
        spots_count: 10
      },
      {
        name: 'LB Nagar Kamineni Hospital Visitor Parking',
        email: 'provider@citycommercial.com',
        location: 'LB Nagar, Hyderabad',
        description: 'Simulated hospital visitor multi-tier parking.',
        vehicle_types: 'Car, Bike',
        capacity: 70,
        price_per_hour: 30.00,
        spots_count: 12
      },
      {
        name: 'Financial District Wave Rock Office Parking',
        email: 'provider@techpark.com',
        location: 'Financial District, Hyderabad',
        description: 'Simulated tech campus multi-level basement parking.',
        vehicle_types: 'Car',
        capacity: 160,
        price_per_hour: 45.00,
        spots_count: 15
      },
      {
        name: 'Nallagandla HUDA Layout Private Driveway',
        email: 'provider@urbanpark.com',
        location: 'Nallagandla, Hyderabad',
        description: 'Simulated gated house driveway for single vehicle.',
        vehicle_types: 'Car',
        capacity: 4,
        price_per_hour: 20.00,
        spots_count: 4
      },
      {
        name: 'Manikonda Puppalguda Commercial Yard',
        email: 'provider@urbanpark.com',
        location: 'Manikonda, Hyderabad',
        description: 'Simulated secured open yard space.',
        vehicle_types: 'Car, Bike',
        capacity: 25,
        price_per_hour: 25.00,
        spots_count: 10
      }
    ];

    for (const item of simulatedListings) {
      const ownerId = userMap[item.email] || userMap['provider@nexus.com'];
      
      // Check if listing already exists
      const [existing] = await connection.query("SELECT id FROM parking_lots WHERE name = ?", [item.name]);
      let lotId;
      if (existing.length > 0) {
        lotId = existing[0].id;
        // Update details
        await connection.query(
          "UPDATE parking_lots SET owner_id=?, location=?, description=?, vehicle_types=?, capacity=?, price_per_hour=? WHERE id=?",
          [ownerId, item.location, item.description, item.vehicle_types, item.capacity, item.price_per_hour, lotId]
        );
      } else {
        // Insert new listing
        const [res] = await connection.query(
          "INSERT INTO parking_lots (owner_id, name, location, description, vehicle_types, capacity, price_per_hour) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [ownerId, item.name, item.location, item.description, item.vehicle_types, item.capacity, item.price_per_hour]
        );
        lotId = res.insertId;
      }

      if (item.name === 'Nexus Mall') {
        const nexusLevels = [
          { name: 'B1', level: -1 },
          { name: 'B2', level: -2 },
          { name: 'B3', level: -3 },
          { name: 'ML1', level: 1 },
          { name: 'ML2', level: 2 },
          { name: 'ML3', level: 3 },
          { name: 'ML4', level: 4 },
          { name: 'ML5', level: 5 },
          { name: 'ML6', level: 6 },
          { name: 'ML7', level: 7 },
          { name: 'ML8', level: 8 },
          { name: 'ML9', level: 9 }
        ];

        for (const nl of nexusLevels) {
          const [fRows] = await connection.query("SELECT id FROM floors WHERE lot_id = ? AND name = ?", [lotId, nl.name]);
          let floorId;
          if (fRows.length === 0) {
            const [fRes] = await connection.query("INSERT INTO floors (lot_id, name, level) VALUES (?, ?, ?)", [lotId, nl.name, nl.level]);
            floorId = fRes.insertId;
          } else {
            floorId = fRows[0].id;
          }

          const [zRows] = await connection.query("SELECT id FROM parking_zones WHERE floor_id = ?", [floorId]);
          let zoneId;
          if (zRows.length === 0) {
            const [zRes] = await connection.query("INSERT INTO parking_zones (floor_id, name, type) VALUES (?, 'Zone A', 'Standard')", [floorId]);
            zoneId = zRes.insertId;
          } else {
            zoneId = zRows[0].id;
          }

          const [sRows] = await connection.query("SELECT id FROM parking_spots WHERE zone_id = ?", [zoneId]);
          if (sRows.length === 0) {
            const spotCount = nl.name.startsWith('B') ? 12 : 8;
            for (let i = 1; i <= spotCount; i++) {
              const isAvailable = (i % 3 !== 0); // ~67% available
              await connection.query("INSERT INTO parking_spots (zone_id, name, is_available) VALUES (?, ?, ?)", [zoneId, `${nl.name}-${i}`, isAvailable]);
            }
          }
        }
      } else {
        // Check if floors exist for this lot
        const [floors] = await connection.query("SELECT id FROM floors WHERE lot_id = ?", [lotId]);
        let floorId;
        if (floors.length === 0) {
          const [fRes] = await connection.query("INSERT INTO floors (lot_id, name, level) VALUES (?, 'Ground Floor', 0)", [lotId]);
          floorId = fRes.insertId;
        } else {
          floorId = floors[0].id;
        }

        // Check if zones exist for this floor
        const [zones] = await connection.query("SELECT id FROM parking_zones WHERE floor_id = ?", [floorId]);
        let zoneId;
        if (zones.length === 0) {
          const [zRes] = await connection.query("INSERT INTO parking_zones (floor_id, name, type) VALUES (?, 'Zone A', 'Standard')", [floorId]);
          zoneId = zRes.insertId;
        } else {
          zoneId = zones[0].id;
        }

        // Check spots
        const [spots] = await connection.query("SELECT id FROM parking_spots WHERE zone_id = ?", [zoneId]);
        if (spots.length === 0) {
          const numSpots = item.spots_count || 10;
          for (let i = 1; i <= numSpots; i++) {
            const isAvailable = (i % 5 !== 0); // 80% available
            await connection.query("INSERT INTO parking_spots (zone_id, name, is_available) VALUES (?, ?, ?)", [zoneId, `P-${i}`, isAvailable]);
          }
        }
      }
    }

    console.log('Verifying entry gates and sensors for all listings...');
    const [allLots] = await connection.query('SELECT id, name FROM parking_lots');
    for (const lot of allLots) {
      const [gates] = await connection.query('SELECT id FROM entry_gates WHERE lot_id = ?', [lot.id]);
      if (gates.length === 0) {
        await connection.query(
          "INSERT INTO entry_gates (lot_id, gate_code, gate_name, gate_type, status) VALUES (?, ?, ?, 'ENTRY', 'active')",
          [lot.id, `GATE-EN-${lot.id}`, `Entry Gate (${lot.name})`]
        );
        await connection.query(
          "INSERT INTO entry_gates (lot_id, gate_code, gate_name, gate_type, status) VALUES (?, ?, ?, 'EXIT', 'active')",
          [lot.id, `GATE-EX-${lot.id}`, `Exit Gate (${lot.name})`]
        );
      }
    }

    const [allSpots] = await connection.query('SELECT id, name FROM parking_spots');
    for (const spot of allSpots) {
      const [sensors] = await connection.query('SELECT id FROM parking_sensors WHERE spot_id = ?', [spot.id]);
      if (sensors.length === 0) {
        await connection.query(
          "INSERT INTO parking_sensors (spot_id, sensor_code, sensor_status) VALUES (?, ?, 'active')",
          [spot.id, `SNS-${spot.id}-${spot.name}`]
        );
      }
    }

    console.log('Database setup and simulated listings seed complete for parkfinder.');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('Setup failed:', err);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw err;
    }
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  setupDB();
}

module.exports = setupDB;
