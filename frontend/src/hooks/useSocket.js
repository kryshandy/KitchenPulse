import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export const useSocket = (room = null) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io('http://localhost:3001', { transports: ['websocket'] });
    }
    socketRef.current = socketInstance;

    if (room) socketInstance.emit('join_room', { room });

    return () => {};
  }, [room]);

  return socketRef.current;
};

export const getSocket = () => socketInstance;