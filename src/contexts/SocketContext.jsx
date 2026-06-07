import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect if the user is authenticated
    if (user && user.id) {
      // Connect to the backend (assumes the React proxy maps or we connect directly to :5000)
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server:', newSocket.id);
        // Join the user-specific room
        newSocket.emit('joinRoom', user.id);
      });

      // Listen for all notifications
      newSocket.on('newNotification', (notification) => {
        // Show toast alert
        toast.info(`🔔 ${notification.message}`, {
          position: "top-right",
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
