import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  socket = io('http://43.204.144.148:5000', {
    auth: { token }
  });

  socket.on('connect', () => console.warn('Connected to WebSocket'));
  socket.on('new-announcement', (data) => {
    console.warn('📣 New announcement received via socket:', data);
    // optionally trigger UI update or context update here
  });
  socket.on('disconnect', () => console.warn('Disconnected from WebSocket'));
};

export const getSocket = () => socket;