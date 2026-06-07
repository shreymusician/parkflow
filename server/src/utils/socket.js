let io;

module.exports = {
  /**
   * @param {import('http').Server} httpServer
   * @param {string[]} allowedOrigins  - list passed in from index.js CORS config
   */
  init: (httpServer, allowedOrigins = []) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        // Mirror the same origin logic as Express CORS
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          if (/^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return callback(null, true);
          if (/^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin)) return callback(null, true);
          callback(new Error(`Socket.IO CORS: origin ${origin} not allowed`));
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // Allow both websocket and long-polling so older/mobile browsers work
      transports: ['websocket', 'polling'],
    });

    io.on('connection', (socket) => {
      console.log('New client connected to Real-Time Server:', socket.id);

      // Clients join specific location rooms for Heatmap updates
      socket.on('joinLocationRoom', (locationId) => {
        socket.join(`location_${locationId}`);
        console.log(`Socket ${socket.id} joined room: location_${locationId}`);
      });

      // Clients join their personal room for notifications
      socket.on('joinUserRoom', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined personal room: user_${userId}`);
      });

      // Support legacy 'joinRoom' event used by SocketContext
      socket.on('joinRoom', (userId) => {
        socket.join(`user_${userId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
  },
};
