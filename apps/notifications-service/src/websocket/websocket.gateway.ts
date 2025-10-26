import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
    namespace: '/notifications',
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('NotificationsGateway');
    private userSockets: Map<string, string> = new Map(); // userId -> socketId

    afterInit(server: Server) {
        this.logger.log('WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);

        const userId = client.handshake.query.userId as string;
        const token = client.handshake.auth.token as string;
        
        if (userId) {
            this.logger.log(`Auto-authenticating user ${userId} on connection`);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                this.logger.log(`User ${userId} disconnected`);
                break;
            }
        }
    }

    @SubscribeMessage('authenticate')
    handleAuthenticate(client: Socket, payload: { userId: string }) {
        try {
            const { userId } = payload;
            
            if (!userId) {
                client.emit('authenticated', { 
                    success: false, 
                    message: 'User ID is required' 
                });
                return;
            }

            this.userSockets.set(userId, client.id);
            this.logger.log(`User ${userId} authenticated with socket ${client.id}`);
            
            client.emit('authenticated', { 
                success: true, 
                message: 'Successfully authenticated',
                userId: userId
            });
        } catch (error) {
            this.logger.error(`Authentication error: ${error.message}`);
            client.emit('authenticated', { 
                success: false, 
                message: 'Authentication failed' 
            });
        }
    }
    emitTaskCreated(data: any) {
        this.logger.log(`Emitting task:created event`);
        this.server.emit('task:created', data);
    }
    emitTaskUpdated(data: any) {
        this.logger.log(`Emitting task:updated event`);
        this.server.emit('task:updated', data);
    }
    emitCommentNew(data: any) {
        this.logger.log(`Emitting comment:new event`);
        this.server.emit('comment:new', data);
    }

    emit(event: string, data: any) {
        this.logger.log(`Emitting ${event} event`);
        this.server.emit(event, data);
    }

    emitToUser(userId: string, event: string, data: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.logger.log(`Emitting ${event} to user ${userId} (socket: ${socketId})`);
            this.server.to(socketId).emit(event, data);
        } else {
            this.logger.warn(`User ${userId} not connected, cannot emit ${event}`);
        }
    }

    emitNotification(userId: string, notification: any) {
        this.emitToUser(userId, 'notification', notification);
    }
}
