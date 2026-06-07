const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('../models/Location');

dotenv.config();

/**
 * 30 real famous parking spots in Bangalore
 * Coordinates: [longitude, latitude]  (GeoJSON order)
 * totalCapacity = 10 per hub (as requested)
 */
const bangaloreHubs = [
  // ── Central Bangalore ──────────────────────────────────────────────────
  {
    name: 'MG Road Metro Parking',
    address: 'MG Road, Near Trinity Circle Metro, Bengaluru 560001',
    coordinates: { type: 'Point', coordinates: [77.6101, 12.9754] },
    totalCapacity: 10,
    basePrice: 60,
  },
  {
    name: 'Brigade Road Multilevel Car Park',
    address: 'Brigade Road, Central Bengaluru 560001',
    coordinates: { type: 'Point', coordinates: [77.6073, 12.9715] },
    totalCapacity: 10,
    basePrice: 70,
  },
  {
    name: 'Cubbon Park Underground Parking',
    address: 'Cubbon Park, Kasturba Road, Bengaluru 560001',
    coordinates: { type: 'Point', coordinates: [77.5912, 12.9763] },
    totalCapacity: 10,
    basePrice: 40,
  },
  {
    name: 'UB City Mall Parking',
    address: 'Vittal Mallya Road, UB City, Bengaluru 560001',
    coordinates: { type: 'Point', coordinates: [77.5970, 12.9716] },
    totalCapacity: 10,
    basePrice: 80,
  },
  {
    name: 'Commercial Street Parking Hub',
    address: 'Commercial Street, Shivajinagar, Bengaluru 560001',
    coordinates: { type: 'Point', coordinates: [77.6079, 12.9837] },
    totalCapacity: 10,
    basePrice: 50,
  },

  // ── East Bangalore ─────────────────────────────────────────────────────
  {
    name: 'Indiranagar 100ft Road Hub',
    address: '100 Feet Road, Indiranagar, Bengaluru 560038',
    coordinates: { type: 'Point', coordinates: [77.6410, 12.9784] },
    totalCapacity: 10,
    basePrice: 60,
  },
  {
    name: 'Indiranagar CMH Road Parking',
    address: 'CMH Road, Indiranagar, Bengaluru 560038',
    coordinates: { type: 'Point', coordinates: [77.6487, 12.9720] },
    totalCapacity: 10,
    basePrice: 50,
  },
  {
    name: 'Whitefield ITPL Tech Park Parking',
    address: 'ITPL Main Road, Whitefield, Bengaluru 560066',
    coordinates: { type: 'Point', coordinates: [77.7400, 12.9878] },
    totalCapacity: 10,
    basePrice: 50,
  },
  {
    name: 'Phoenix Marketcity Whitefield',
    address: 'Whitefield Main Road, Mahadevapura, Bengaluru 560048',
    coordinates: { type: 'Point', coordinates: [77.7480, 12.9975] },
    totalCapacity: 10,
    basePrice: 80,
  },
  {
    name: 'Marathahalli Bridge Parking',
    address: 'Marathahalli, Outer Ring Road, Bengaluru 560037',
    coordinates: { type: 'Point', coordinates: [77.7024, 12.9562] },
    totalCapacity: 10,
    basePrice: 40,
  },

  // ── South Bangalore ────────────────────────────────────────────────────
  {
    name: 'Koramangala BDA Complex',
    address: 'BDA Complex, 5th Block, Koramangala, Bengaluru 560034',
    coordinates: { type: 'Point', coordinates: [77.6245, 12.9272] },
    totalCapacity: 10,
    basePrice: 40,
  },
  {
    name: 'Forum Mall Koramangala',
    address: 'Hosur Road, Koramangala, Bengaluru 560095',
    coordinates: { type: 'Point', coordinates: [77.6103, 12.9233] },
    totalCapacity: 10,
    basePrice: 70,
  },
  {
    name: 'JP Nagar Phase 1 Parking',
    address: 'JP Nagar 1st Phase, Bengaluru 560078',
    coordinates: { type: 'Point', coordinates: [77.5873, 12.9079] },
    totalCapacity: 10,
    basePrice: 30,
  },
  {
    name: 'Jayanagar 4th Block Shopping Complex',
    address: '4th Block, Jayanagar, Bengaluru 560011',
    coordinates: { type: 'Point', coordinates: [77.5826, 12.9253] },
    totalCapacity: 10,
    basePrice: 35,
  },
  {
    name: 'Lalbagh Botanical Garden Parking',
    address: 'Lalbagh Road, Mavalli, Bengaluru 560004',
    coordinates: { type: 'Point', coordinates: [77.5852, 12.9503] },
    totalCapacity: 10,
    basePrice: 20,
  },

  // ── North Bangalore ────────────────────────────────────────────────────
  {
    name: 'Hebbal Flyover Parking Zone',
    address: 'Hebbal, Outer Ring Road, Bengaluru 560024',
    coordinates: { type: 'Point', coordinates: [77.5981, 13.0352] },
    totalCapacity: 10,
    basePrice: 35,
  },
  {
    name: 'Manyata Tech Park Parking',
    address: 'Manyata Embassy Business Park, Nagawara, Bengaluru 560045',
    coordinates: { type: 'Point', coordinates: [77.6290, 13.0456] },
    totalCapacity: 10,
    basePrice: 50,
  },
  {
    name: 'Orion Mall Rajajinagar',
    address: 'Rajajinagar, Dr. Rajkumar Road, Bengaluru 560010',
    coordinates: { type: 'Point', coordinates: [77.5553, 12.9874] },
    totalCapacity: 10,
    basePrice: 80,
  },
  {
    name: 'Yeshwanthpur Metro Parking',
    address: 'Yeshwanthpur Junction, Bengaluru 560022',
    coordinates: { type: 'Point', coordinates: [77.5466, 13.0249] },
    totalCapacity: 10,
    basePrice: 40,
  },
  {
    name: 'Kempegowda International Airport P1',
    address: 'KIAL Road, Devanahalli, Bengaluru 560300',
    coordinates: { type: 'Point', coordinates: [77.7081, 13.1986] },
    totalCapacity: 10,
    basePrice: 100,
  },

  // ── West Bangalore ─────────────────────────────────────────────────────
  {
    name: 'Rajajinagar Industrial Area Parking',
    address: 'Rajajinagar Industrial Town, Bengaluru 560044',
    coordinates: { type: 'Point', coordinates: [77.5476, 12.9946] },
    totalCapacity: 10,
    basePrice: 30,
  },
  {
    name: 'Vijayanagar Bus Terminal Parking',
    address: 'Vijayanagar, Bengaluru 560040',
    coordinates: { type: 'Point', coordinates: [77.5318, 12.9690] },
    totalCapacity: 10,
    basePrice: 25,
  },

  // ── Tech Corridors & ORR ───────────────────────────────────────────────
  {
    name: 'Bellandur Outer Ring Road Hub',
    address: 'Outer Ring Road, Bellandur, Bengaluru 560103',
    coordinates: { type: 'Point', coordinates: [77.6740, 12.9264] },
    totalCapacity: 10,
    basePrice: 55,
  },
  {
    name: 'Electronic City Phase 1 Parking',
    address: 'Electronic City Phase 1, Bengaluru 560100',
    coordinates: { type: 'Point', coordinates: [77.6601, 12.8458] },
    totalCapacity: 10,
    basePrice: 45,
  },
  {
    name: 'Ecospace Business Park Parking',
    address: 'Bellandur, Outer Ring Road, Bengaluru 560037',
    coordinates: { type: 'Point', coordinates: [77.6666, 12.9311] },
    totalCapacity: 10,
    basePrice: 50,
  },

  // ── Popular Shopping & Mixed ───────────────────────────────────────────
  {
    name: 'Garuda Mall Magrath Road',
    address: 'Magrath Road, Ashok Nagar, Bengaluru 560025',
    coordinates: { type: 'Point', coordinates: [77.6049, 12.9717] },
    totalCapacity: 10,
    basePrice: 75,
  },
  {
    name: 'Mantri Square Malleshwaram',
    address: 'Sampige Road, Malleshwaram, Bengaluru 560003',
    coordinates: { type: 'Point', coordinates: [77.5699, 13.0027] },
    totalCapacity: 10,
    basePrice: 80,
  },
  {
    name: 'Majestic / KSR Railway Station Parking',
    address: 'Dr. S. Subramanya Road, Majestic, Bengaluru 560009',
    coordinates: { type: 'Point', coordinates: [77.5718, 12.9766] },
    totalCapacity: 10,
    basePrice: 30,
  },
  {
    name: 'Koramangala Agara Lake Parking',
    address: 'Agara, HSR Layout, Bengaluru 560068',
    coordinates: { type: 'Point', coordinates: [77.6404, 12.9120] },
    totalCapacity: 10,
    basePrice: 30,
  },
  {
    name: 'Silk Board Junction Parking',
    address: 'Silk Board Junction, Hosur Road, Bengaluru 560068',
    coordinates: { type: 'Point', coordinates: [77.6231, 12.9174] },
    totalCapacity: 10,
    basePrice: 35,
  },
];

const seedLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Location.countDocuments({});
    if (existing > 0) {
      await Location.deleteMany({});
      console.log(`🗑  Cleared ${existing} existing location(s)`);
    }

    const inserted = await Location.insertMany(bangaloreHubs);
    console.log(`✅ Seeded ${inserted.length} Bangalore parking hubs (10 slots each = ${inserted.length * 10} total)`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seedLocations();
