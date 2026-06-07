import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const SocketContext = createContext();

// Read from .env — falls back to localhost for plain desktop dev
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect when the user is authenticated
    if (user && user.id) {
      const newSocket = io(SOCKET_URL, {
        // Allow both transports — websocket first, polling as fallback
        // This ensures mobile browsers and older devices work reliably
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server:', newSocket.id);
        // Join the user-specific room for personal notifications
        newSocket.emit('joinUserRoom', user.id);
        // Legacy event name kept for backward compatibility
        newSocket.emit('joinRoom', user.id);
      });

      newSocket.on('connect_error', (err) => {
        console.warn('Socket.IO connection error:', err.message);
      });

      // Listen for real-time notifications
      newSocket.on('newNotification', (notification) => {
        toast.info(`🔔 ${notification.message}`, {
          position: 'top-right',
          autoClose: 5000,
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
