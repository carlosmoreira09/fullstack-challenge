import {
    Module
} from '@nestjs/common';
import {ClientsModule} from "@nestjs/microservices/module/clients.module";
import {Transport} from "@nestjs/microservices";
import {NotificationsController} from "./notifications.controller";



@Module({
    imports: [
        ClientsModule.register([
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
    controllers: [NotificationsController],
    providers: [],
    exports: []
})
export class NotificationsModule {}
