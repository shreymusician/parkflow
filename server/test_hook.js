const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reservation = require('./src/models/Reservation');

dotenv.config();

async function testHook() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create a dummy reservation
    const r = new Reservation({
      userId: new mongoose.Types.ObjectId(),
      vehicleId: new mongoose.Types.ObjectId(),
      slotId: new mongoose.Types.ObjectId(),
      startTime: new Date(),
      endTime: new Date()
    });
    
    await r.save();
    console.log('Success, bookingId:', r.bookingId);
  } catch (err) {
    console.error('ERROR ENCOUNTERED:', err.message);
  }
  process.exit();
}

testHook();
