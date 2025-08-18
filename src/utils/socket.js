// src/utils/socket.js
// Socket.io client setup for fresh-app
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL || 'http://localhost:5000';

// Pass token for authentication
export function createSocket(token) {
  return io(SOCKET_SERVER_URL, {
    auth: { token },
    transports: ['websocket'],
  });
}

// Usage example:
// import { createSocket } from '../utils/socket';
// const socket = createSocket(userToken);
// socket.on('receiveMessage', ...);
// socket.emit('sendMessage', ...);
