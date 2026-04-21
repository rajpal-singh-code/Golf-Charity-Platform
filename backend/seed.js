/**
 * SEED SCRIPT — run once to populate initial data
 * Usage: node seed.js
 * Make sure your .env file has MONGO_URI set first
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Charity = require('./models/Charity');
const Score = require('./models/Score');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
};

const seed = async () => {
  await connectDB();

  // ── Clear existing data ───────────────────────────────────────
  await User.deleteMany({});
  await Charity.deleteMany({});
  await Score.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // ── Seed Charities ────────────────────────────────────────────
  const charities = await Charity.insertMany([
    {
      name: 'Cancer Research UK',
      description: 'We are the world\'s leading independent cancer research charity. We fund scientists, doctors and nurses who work to beat cancer.',
      category: 'health',
      website: 'https://www.cancerresearchuk.org',
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Golf Foundation',
      description: 'The Golf Foundation creates life-changing opportunities for young people through the sport of golf, helping them develop confidence, resilience, and essential life skills.',
      category: 'sports',
      website: 'https://www.golf-foundation.org',
      isFeatured: true,
      isActive: true,
      upcomingEvents: [
        { title: 'Junior Golf Day 2026', date: new Date('2026-06-15'), description: 'Annual junior golf day for supported youth.' },
      ],
    },
    {
      name: 'WWF UK',
      description: 'We work to build a future where people and nature can thrive. We focus on wildlife, forests, oceans, and tackling climate change.',
      category: 'environment',
      website: 'https://www.wwf.org.uk',
      isFeatured: false,
      isActive: true,
    },
    {
      name: 'The Access Project',
      description: 'We help talented young people from disadvantaged backgrounds get into top universities through expert tutoring and mentoring.',
      category: 'education',
      website: 'https://www.theaccessproject.org.uk',
      isActive: true,
    },
    {
      name: 'Age UK',
      description: 'We believe in a world where older people flourish. We provide information, advice and local services to help people love life at any age.',
      category: 'community',
      website: 'https://www.ageuk.org.uk',
      isActive: true,
    },
  ]);
  console.log(`✅ Seeded ${charities.length} charities`);

  // ── Seed Admin User ───────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@golfgive.com',
    password: 'admin123',   // ← Change this in production!
    role: 'admin',
    charityPercentage: 10,
  });
  await Score.create({ user: admin._id, entries: [] });
  console.log('✅ Admin created: admin@golfgive.com / admin123');

  // ── Seed Test User ─────────────────────────────────────────────
  const testUser = await User.create({
    name: 'Test Player',
    email: 'player@golfgive.com',
    password: 'player123',  // ← Change this in production!
    role: 'user',
    selectedCharity: charities[0]._id,
    charityPercentage: 15,
  });
  await Score.create({
    user: testUser._id,
    entries: [
      { value: 34, date: new Date('2026-04-01') },
      { value: 28, date: new Date('2026-03-22') },
      { value: 31, date: new Date('2026-03-15') },
    ],
  });
  console.log('✅ Test player created: player@golfgive.com / player123');

  console.log('\n🎉 Seed complete! Use these credentials to log in:\n');
  console.log('  Admin:  admin@golfgive.com   / admin123');
  console.log('  Player: player@golfgive.com  / player123\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
