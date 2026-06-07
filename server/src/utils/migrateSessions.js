const mongoose = require('mongoose');
require('dotenv').config();

const ParkingSession = require('../models/ParkingSession');

const migrateSessions = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const sessions = await ParkingSession.find({ sessionStatus: 'COMPLETED' });
    console.log(`Found ${sessions.length} completed sessions`);

    let counter = 0;
    for (const session of sessions) {
      if (session.exitTime && session.entryTime) {
        const diffMs = session.exitTime.getTime() - session.entryTime.getTime();
        session.duration = Math.round(diffMs / 60000); // convert ms to minutes
        session.totalAmount = 10 + (session.duration * 2);
        
        await session.save();
        counter++;
      }
    }

    console.log(`Successfully migrated ${counter} sessions.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateSessions();
