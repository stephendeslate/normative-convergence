'use client';

import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let messagingSocket: Socket | null = null;
let notificationsSocket: Socket | null = null;

export function getMessagingSocket(): Socket {
  if (!messagingSocket) {
    messagingSocket = io(`${API_URL}/messaging`, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return messagingSocket;
}

export function getNotificationsSocket(): Socket {
  if (!notificationsSocket) {
    notificationsSocket = io(`${API_URL}/notifications`, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return notificationsSocket;
}
