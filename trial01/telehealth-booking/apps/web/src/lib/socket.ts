import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from './auth';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  const { accessToken } = useAuthStore.getState();

  socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('disconnect', () => {
    const { accessToken: currentToken } = useAuthStore.getState();
    if (currentToken && socket) {
      socket.auth = { token: currentToken };
      socket.connect();
    }
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
