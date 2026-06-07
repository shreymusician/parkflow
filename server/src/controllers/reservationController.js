const ReservationService = require('../services/reservation.service');
const Vehicle = require('../models/Vehicle');

exports.requestReservation = async (req, res) => {
  try {
    const { vehicleId, locationId, duration } = req.body;

    if (!vehicleId || !locationId || !duration) {
      return res.status(400).json({ success: false, error: 'Please provide vehicleId, locationId, and duration' });
    }

    // Validate vehicle ownership
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized vehicle access' });
    }

    const result = await ReservationService.requestReservation(req.user._id, vehicle, locationId, duration);
    
    if (result.waitlisted) {
      return res.status(202).json(result); // 202 Accepted, but waitlisted
    }

    return res.status(201).json(result); // 201 Created reservation

  } catch (err) {
    if (err.message === 'CONCURRENCY_CONFLICT') {
      return res.status(409).json({ success: false, error: 'High traffic. Please try again in a moment.' });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getReservations = async (req, res) => {
  try {
    const reservations = await require('../models/Reservation')
      .find({ userId: req.user._id, isDeleted: false })
      .populate('locationId')
      .populate('vehicleId')
      .populate('slotId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
