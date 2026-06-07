const mongoose = require('mongoose');
const { SLOT_TYPES, SLOT_STATUS } = require('../constants/enums');

const slotSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  slotNumber: {
    type: String,
    required: true,
  },
  slotType: {
    type: String,
    enum: Object.values(SLOT_TYPES),
    default: SLOT_TYPES.NORMAL,
  },
  floor: {
    type: String,
    default: 'Ground',
  },
  status: {
    type: String,
    enum: Object.values(SLOT_STATUS),
    default: SLOT_STATUS.AVAILABLE,
  },
  distanceFromEntrance: {
    type: Number, // In meters, used by scoring algorithm
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

// Compound index to quickly find available slots in a specific location
slotSchema.index({ locationId: 1, status: 1 });

module.exports = mongoose.model('Slot', slotSchema);
