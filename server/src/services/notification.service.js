const Notification = require('../models/Notification');
const { DELIVERY_STATUS, SOURCES } = require('../constants/enums');
const socketIO = require('../utils/socket');

class NotificationService {
  /**
   * Create a persistent notification and instantly emit it via Socket.io
   */
  static async sendNotification(userId, type, message, source = SOURCES.REAL) {
    try {
      // 1. Persist the notification to the database
      const notification = await Notification.create({
        userId,
        notificationType: type,
        message,
        deliveryStatus: DELIVERY_STATUS.SENT,
        source
      });

      // 2. Emit the event in real-time to the specific user's socket room
      const io = socketIO.getIO();
      io.to(`user_${userId}`).emit('newNotification', {
        type,
        message,
        createdAt: notification.createdAt
      });

      return notification;
    } catch (error) {
      console.error('Notification Service Error:', error.message);
      // Even if emit fails, we don't throw an error to prevent breaking the main transaction workflow
    }
  }

  /**
   * Broadcast a general update to a specific Location room (e.g. Occupancy Heatmap updates)
   */
  static broadcastLocationUpdate(locationId, eventType, payload) {
    try {
      const io = socketIO.getIO();
      io.to(`location_${locationId}`).emit(eventType, payload);
    } catch (error) {
      console.error('Socket Broadcast Error:', error.message);
    }
  }
}

module.exports = NotificationService;
