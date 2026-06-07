const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('../models/Location');
const Slot = require('../models/Slot');
const { SLOT_TYPES, SLOT_STATUS } = require('../constants/enums');

dotenv.config();

/**
 * Floor assignment based on slot index within the location.
 * Assigns 80 slots per floor so large hubs (800 slots) get 10 floors.
 */
const getFloor = (slotIndex, totalCapacity) => {
  const slotsPerFloor = Math.max(40, Math.ceil(totalCapacity / 8));
  const floorNum = Math.floor(slotIndex / slotsPerFloor);
  if (floorNum === 0) return 'Ground Floor';
  return `Level ${floorNum}`;
};

/**
 * Slot type distribution (designed for 10-slot hubs):
 *  Slot 5  → EV
 *  Slot 8  → VIP
 *  Slot 10 → ACCESSIBLE
 *  rest    → NORMAL
 */
const getSlotType = (i) => {
  if (i === 5)  return SLOT_TYPES.EV;
  if (i === 8)  return SLOT_TYPES.VIP;
  if (i === 10) return SLOT_TYPES.ACCESSIBLE;
  return SLOT_TYPES.NORMAL;
};

const seedSlots = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Slot.countDocuments();
    if (existing > 0) {
      await Slot.deleteMany({});
      console.log(`🗑  Cleared ${existing} existing slot(s)`);
    }

    const locations = await Location.find({});
    console.log(`📍 Found ${locations.length} locations to populate`);

    let slotsToInsert = [];

    for (const location of locations) {
      const total = location.totalCapacity;
      for (let i = 1; i <= total; i++) {
        slotsToInsert.push({
          locationId:           location._id,
          slotNumber:           `S${i}`,
          slotType:             getSlotType(i),
          floor:                getFloor(i - 1, total),
          status:               SLOT_STATUS.AVAILABLE,
          distanceFromEntrance: Math.floor(Math.random() * 150) + 5, // 5–155m
        });
      }
    }

    // Insert in batches of 500 to avoid memory spikes
    const BATCH = 500;
    for (let b = 0; b < slotsToInsert.length; b += BATCH) {
      await Slot.insertMany(slotsToInsert.slice(b, b + BATCH));
    }

    console.log(`✅ Successfully seeded ${slotsToInsert.length} slots across ${locations.length} hubs`);

    // Summary per location
    const summary = locations.map(l => `  • ${l.name}: ${l.totalCapacity} slots`).join('\n');
    console.log('\nSlot breakdown:\n' + summary);

    process.exit(0);
  } catch (error) {
    console.error('❌ Slot seed failed:', error);
    process.exit(1);
  }
};

seedSlots();
