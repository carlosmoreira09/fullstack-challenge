import {
    Module
} from '@nestjs/common';
import {CommentsController} from "./comments.controller";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {CommentsService} from "./comments.service";
import {NotificationsService} from "../notifications/notifications.service";
import {AuthModule} from "../auth/auth.module";



@Module({
    imports: [
        AuthModule,
        ClientsModule.register([
                {
                    name: 'AUTH_SERVICE',
                    transport: Transport.TCP,
                    options: {
                        host: '127.0.0.1',
                        port: 3002
                    }
                },
            {
                name: 'TASKS_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3004
                }
            },
            {
                name: 'USERS_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3005
                }
            },
            {
                name: 'NOTIFICATIONS_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3003
                }
            }
            ])
    ],
    controllers: [CommentsController],
    providers: [CommentsService, NotificationsService],
    exports: []
})
export class CommentsModule {}
