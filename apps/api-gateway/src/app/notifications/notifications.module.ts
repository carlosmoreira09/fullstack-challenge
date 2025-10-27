import {
    Module
} from '@nestjs/common';
import {ClientsModule} from "@nestjs/microservices/module/clients.module";
import {Transport} from "@nestjs/microservices";
import {NotificationsController} from "./notifications.controller";
import {NotificationsService} from "./notifications.service";
import {AuthModule} from "../auth/auth.module";



@Module({
    imports: [
        AuthModule,
        ClientsModule.register([
            {
                name: 'NOTIFICATIONS_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3003
                }
            },
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
            }
        ])
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService]
})
export class NotificationsModule {}
