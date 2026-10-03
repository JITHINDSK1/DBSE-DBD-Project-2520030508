require('dotenv').config();
const mongoose = require('mongoose');
const Parking = require('./models/Parking');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedData = [
  { name: 'Inorbit Mall Parking', area: 'Madhapur', city: 'Hyderabad', address: 'Madhapur', lat: 17.4343, lng: 78.3866, totalSlots: 200, availableSlots: 42, pricePerHour: 50, openTime: '06:00', closeTime: '23:00', type: 'mall', covered: true },
  { name: 'GVK One Garage', area: 'Banjara Hills', city: 'Hyderabad', address: 'Banjara Hills', lat: 17.4173, lng: 78.4485, totalSlots: 150, availableSlots: 15, pricePerHour: 80, openTime: '08:00', closeTime: '23:00', type: 'mall', covered: true },
  { name: 'Hitech City Metro Station', area: 'Hitech City', city: 'Hyderabad', address: 'Hitech City', lat: 17.4475, lng: 78.3850, totalSlots: 300, availableSlots: 110, pricePerHour: 30, openTime: '05:00', closeTime: '23:30', type: 'metro', covered: false },
  { name: 'Sarath City Capital Mall', area: 'Kondapur', city: 'Hyderabad', address: 'Kondapur', lat: 17.4580, lng: 78.3639, totalSlots: 400, availableSlots: 5, pricePerHour: 60, openTime: '08:00', closeTime: '23:00', type: 'mall', covered: true },
  { name: 'Forum Sujana Mall Parking', area: 'Kukatpally', city: 'Hyderabad', address: 'Kukatpally', lat: 17.4842, lng: 78.3888, totalSlots: 250, availableSlots: 28, pricePerHour: 40, openTime: '08:00', closeTime: '22:30', type: 'mall', covered: true },
  { name: 'Raidurg Metro Parking', area: 'HITEC City', city: 'Hyderabad', address: 'HITEC City', lat: 17.4429, lng: 78.3789, totalSlots: 200, availableSlots: 65, pricePerHour: 30, openTime: '05:00', closeTime: '23:30', type: 'metro', covered: false },
  { name: 'Atrium Mall Basement', area: 'Gachibowli', city: 'Hyderabad', address: 'Gachibowli', lat: 17.4365, lng: 78.3615, totalSlots: 100, availableSlots: 22, pricePerHour: 50, openTime: '09:00', closeTime: '22:00', type: 'mall', covered: true },
  { name: 'Manjeera Mall Parking', area: 'Kukatpally', city: 'Hyderabad', address: 'Kukatpally', lat: 17.4862, lng: 78.3912, totalSlots: 150, availableSlots: 18, pricePerHour: 40, openTime: '09:00', closeTime: '22:00', type: 'mall', covered: true },
  { name: 'Nampally Automated MLP', area: 'Nampally', city: 'Hyderabad', address: 'Nampally', lat: 17.3888, lng: 78.4688, totalSlots: 120, availableSlots: 48, pricePerHour: 35, openTime: '00:00', closeTime: '23:59', type: 'mlp', covered: true },
  { name: 'DLF Cyber City Parking', area: 'Gachibowli', city: 'Hyderabad', address: 'Gachibowli', lat: 17.4326, lng: 78.3562, totalSlots: 500, availableSlots: 55, pricePerHour: 40, openTime: '00:00', closeTime: '23:59', type: 'other', covered: true },
  { name: 'City Centre Mall Parking', area: 'Banjara Hills', city: 'Hyderabad', address: 'Banjara Hills', lat: 17.4137, lng: 78.4497, totalSlots: 150, availableSlots: 12, pricePerHour: 70, openTime: '08:00', closeTime: '23:00', type: 'mall', covered: true },
  { name: 'SLN Terminus Parking', area: 'Gachibowli', city: 'Hyderabad', address: 'Gachibowli', lat: 17.4439, lng: 78.3600, totalSlots: 120, availableSlots: 31, pricePerHour: 45, openTime: '09:00', closeTime: '23:00', type: 'mall', covered: true },
  { name: 'Western Aqua Basement', area: 'Kondapur', city: 'Hyderabad', address: 'Kondapur', lat: 17.4610, lng: 78.3620, totalSlots: 100, availableSlots: 19, pricePerHour: 50, openTime: '08:00', closeTime: '22:00', type: 'other', covered: true },
  { name: 'Krishe Sapphire Parking', area: 'Madhapur', city: 'Hyderabad', address: 'Madhapur', lat: 17.4390, lng: 78.3840, totalSlots: 150, availableSlots: 24, pricePerHour: 45, openTime: '07:00', closeTime: '23:00', type: 'other', covered: true },
  { name: 'Cyber Pearl Parking', area: 'HITEC City', city: 'Hyderabad', address: 'HITEC City', lat: 17.4480, lng: 78.3810, totalSlots: 200, availableSlots: 38, pricePerHour: 40, openTime: '00:00', closeTime: '23:59', type: 'other', covered: true },
  { name: 'Shilparamam Parking', area: 'HITEC City', city: 'Hyderabad', address: 'HITEC City', lat: 17.4510, lng: 78.3800, totalSlots: 300, availableSlots: 80, pricePerHour: 30, openTime: '10:00', closeTime: '20:00', type: 'other', covered: false },
  { name: 'Miyapur Metro Parking', area: 'Miyapur', city: 'Hyderabad', address: 'Miyapur', lat: 17.4971, lng: 78.3662, totalSlots: 400, availableSlots: 95, pricePerHour: 30, openTime: '05:00', closeTime: '23:30', type: 'metro', covered: false },
  { name: 'AMB Cinemas', area: 'Kondapur', city: 'Hyderabad', address: 'Kondapur', lat: 17.4580, lng: 78.3639, totalSlots: 250, availableSlots: 21, pricePerHour: 50, openTime: '09:00', closeTime: '23:59', type: 'mall', covered: true },
  { name: 'IKEA External Parking', area: 'Gachibowli', city: 'Hyderabad', address: 'Gachibowli', lat: 17.4367, lng: 78.3752, totalSlots: 600, availableSlots: 140, pricePerHour: 40, openTime: '09:00', closeTime: '22:00', type: 'other', covered: false }
];

async function runSeed() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Seed Demo User
    const demoEmail = 'demo@parkfinder.com';
    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      const hashed = await bcrypt.hash('password123', 10);
      demoUser = new User({ name: 'Demo User', email: demoEmail, password: hashed });
      await demoUser.save();
      console.log('Created Demo User');
    }

    console.log('Clearing old parkings...');
    await Parking.deleteMany({});
    
    console.log('Inserting seed data...');
    await Parking.insertMany(seedData);
    
    console.log(`Seed successful! Inserted ${seedData.length} parkings.`);
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

runSeed();
