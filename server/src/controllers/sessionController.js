const SessionService = require('../services/session.service');

exports.startSession = async (req, res) => {
  try {
    const { reservationId } = req.body;
    if (!reservationId) {
      return res.status(400).json({ success: false, error: 'Please provide reservationId' });
    }

    const session = await SessionService.startSession(reservationId, req.user._id);
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Please provide sessionId' });
    }

    const session = await SessionService.endSession(sessionId, req.user._id);
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await require('../models/ParkingSession')
      .find({ userId: req.user._id })
      .populate('reservationId')
      .populate('vehicleId')
      .populate('slotId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
