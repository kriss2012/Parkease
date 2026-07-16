// Populates the database with demo data for all roles so you can log in
// and explore the app immediately. Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Mall = require('../models/Mall');
const ParkingFloor = require('../models/ParkingFloor');
const ParkingSlot = require('../models/ParkingSlot');

const run = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Mall.deleteMany({}),
    ParkingFloor.deleteMany({}),
    ParkingSlot.deleteMany({}),
  ]);

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Platform Admin', email: 'admin@parkease.com', password: 'Admin@123', role: 'admin',
  });
  const owner = await User.create({
    name: 'Raj Malhotra', email: 'owner@parkease.com', password: 'Owner@123', role: 'owner', approvalStatus: 'approved',
  });
  const guard = await User.create({
    name: 'Suresh Kumar', email: 'guard@parkease.com', password: 'Guard@123', role: 'guard',
  });
  const user = await User.create({
    name: 'Anita Sharma', email: 'user@parkease.com', password: 'User@123', role: 'user',
  });

  console.log('Creating mall...');
  const mall = await Mall.create({
    owner: owner._id,
    name: 'Galaxy Grand Mall',
    description: 'A premium shopping and entertainment destination.',
    address: '123 MG Road',
    city: 'Bengaluru',
    location: { type: 'Point', coordinates: [77.5946, 12.9716] },
    images: [],
    openingHours: { open: '06:00', close: '23:00', is24Hours: false },
    pricing: { hourly: 20, daily: 150, monthly: 2000 },
    status: 'approved',
  });

  guard.assignedMall = mall._id;
  await guard.save();

  console.log('Creating floors + slots...');
  const floorDefs = [
    { name: 'Basement', level: -1 },
    { name: 'Ground', level: 0 },
    { name: 'First', level: 1 },
  ];

  for (const def of floorDefs) {
    const floor = await ParkingFloor.create({ mall: mall._id, ...def });
    const slots = [];
    for (let i = 1; i <= 15; i++) {
      slots.push({
        mall: mall._id,
        floor: floor._id,
        slotNumber: `${def.name[0]}${String(i).padStart(2, '0')}`,
        vehicleType: i % 5 === 0 ? '2-wheeler' : i % 7 === 0 ? 'ev' : '4-wheeler',
        status: 'available',
      });
    }
    await ParkingSlot.insertMany(slots);
    floor.totalSlots = slots.length;
    await floor.save();
  }

  console.log('\nSeed complete! Demo logins:');
  console.log('  Admin:  admin@parkease.com / Admin@123');
  console.log('  Owner:  owner@parkease.com / Owner@123');
  console.log('  Guard:  guard@parkease.com / Guard@123');
  console.log('  User:   user@parkease.com  / User@123');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
