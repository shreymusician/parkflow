let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });

    io.on('connection', (socket) => {
      console.log('New client connected to Real-Time Server:', socket.id);

      // Clients can join specific location rooms to receive targeted updates (e.g., Heatmap)
      socket.on('joinLocationRoom', (locationId) => {
        socket.join(`location_${locationId}`);
        console.log(`Socket ${socket.id} joined room: location_${locationId}`);
      });

      // Clients can join specific user rooms for personal notifications
      socket.on('joinUserRoom', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined personal room: user_${userId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
