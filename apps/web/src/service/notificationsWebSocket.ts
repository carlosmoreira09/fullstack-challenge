import { io, Socket } from 'socket.io-client'

export const notificationsSocket: Socket = io('http://localhost:3003', {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
})

notificationsSocket.on('error', (error) => {
    console.error('WebSocket error:', error)
})