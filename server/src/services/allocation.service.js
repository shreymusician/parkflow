const Slot = require('../models/Slot');
const Location = require('../models/Location');
const { SLOT_STATUS, VEHICLE_TYPES, SLOT_TYPES } = require('../constants/enums');

/**
 * Smart Allocation Engine Service
 * Implements the scoring algorithm to find the optimal parking slot.
 * Final Score = (0.4 × Distance) + (0.3 × Occupancy Balance) + (0.2 × Vehicle Compatibility) + (0.1 × Priority)
 */

class AllocationEngineService {
  
  // Calculate Vehicle Compatibility Score (0 to 100)
  static _calculateCompatibility(vehicleType, slotType) {
    if (vehicleType === VEHICLE_TYPES.EV && slotType === SLOT_TYPES.EV) return 100;
    if (vehicleType === VEHICLE_TYPES.BIKE && slotType === SLOT_TYPES.NORMAL) return 80; // Bikes can use normal slots but not ideal
    if (vehicleType === VEHICLE_TYPES.CAR && slotType === SLOT_TYPES.NORMAL) return 100;
    
    // Fallbacks
    if (slotType === SLOT_TYPES.ACCESSIBLE || slotType === SLOT_TYPES.VIP) return 10; // Lowest priority for standard vehicles
    return 50; 
  }

  // Calculate Distance Score (0 to 100)
  // Closer to entrance = higher score
  static _calculateDistanceScore(distanceFromEntrance) {
    // Assuming max distance is roughly 500 meters
    const normalized = Math.max(0, 100 - (distanceFromEntrance / 5));
    return normalized;
  }

  /**
   * Find the optimal slot for a given location and vehicle
   * @param {string} locationId - The ID of the parking location
   * @param {string} vehicleType - The type of vehicle (CAR, BIKE, EV)
   * @param {boolean} isAccessible - Does the user need accessible parking?
   * @param {boolean} isVip - Is the user a VIP?
   */
  static async findOptimalSlot(locationId, vehicleType, isAccessible = false, isVip = false) {
    // 1. Fetch all available slots for this location
    const availableSlots = await Slot.find({
      locationId,
      status: SLOT_STATUS.AVAILABLE,
      isDeleted: false
    });

    if (availableSlots.length === 0) {
      return null; // Triggers waitlist flow
    }

    // 2. We skip occupancy balance for individual slot scoring because they are all in the same location.
    // Occupancy balance is handled at the Recommendation Service level (between locations).
    // Here we just use Distance, Compatibility, and Priority.

    let bestSlot = null;
    let highestScore = -1;

    for (const slot of availableSlots) {
      let score = 0;

      // Distance Score (Weight: 40%)
      const distanceScore = this._calculateDistanceScore(slot.distanceFromEntrance);
      score += (0.4 * distanceScore);

      // Compatibility Score (Weight: 20%)
      const compatScore = this._calculateCompatibility(vehicleType, slot.slotType);
      score += (0.2 * compatScore);

      // Priority Score (Weight: 10%... inflated to 40% here since Occupancy Balance is omitted)
      let priorityScore = 0;
      if (isAccessible && slot.slotType === SLOT_TYPES.ACCESSIBLE) priorityScore = 100;
      else if (isVip && slot.slotType === SLOT_TYPES.VIP) priorityScore = 100;
      else if (!isAccessible && !isVip && slot.slotType === SLOT_TYPES.NORMAL) priorityScore = 80;
      
      score += (0.4 * priorityScore);

      if (score > highestScore) {
        highestScore = score;
        bestSlot = slot;
      }
    }

    return bestSlot;
  }

  /**
   * Attempt to lock a slot atomically (Concurrency Protection)
   */
  static async lockSlotAtomically(slotId) {
    // Using findOneAndUpdate with specific status criteria prevents double-booking
    const lockedSlot = await Slot.findOneAndUpdate(
      { _id: slotId, status: SLOT_STATUS.AVAILABLE, isDeleted: false },
      { $set: { status: SLOT_STATUS.RESERVED } },
      { new: true } // Return the updated document
    );

    return lockedSlot; // Returns null if someone else locked it first
  }
}

module.exports = AllocationEngineService;
