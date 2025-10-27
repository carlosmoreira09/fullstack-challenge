import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client';

export const notificationsSocket: Socket = io(
  'http://localhost:3006/notifications',
  {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  },
)

notificationsSocket.on('error', (error) => {
  console.error('WebSocket error:', error)
})
