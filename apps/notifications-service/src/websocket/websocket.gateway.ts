import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
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

    afterInit(server: Server) {
        this.logger.log('WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
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
}
