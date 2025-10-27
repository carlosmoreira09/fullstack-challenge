import {
    Module
} from '@nestjs/common';
import {CommentsController} from "./comments.controller";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {CommentsService} from "./comments.service";
import {NotificationsService} from "../notifications/notifications.service";
import {AuthModule} from "../auth/auth.module";
import { getMicroserviceConfig } from '../../helpers/microservice.helper';



@Module({
    imports: [
        AuthModule,
        ClientsModule.register([
                {
                    name: 'AUTH_SERVICE',
                    transport: Transport.TCP,
                    options: getMicroserviceConfig('AUTH_SERVICE_URL', 'localhost', 3002)
                },
            {
                name: 'TASKS_SERVICE',
                transport: Transport.TCP,
                options: getMicroserviceConfig('TASKS_SERVICE_URL', 'localhost', 3004)
            },
            {
                name: 'USERS_SERVICE',
                transport: Transport.TCP,
                options: getMicroserviceConfig('USER_SERVICE_URL', 'localhost', 3005)
            },
            {
                name: 'NOTIFICATIONS_SERVICE',
                transport: Transport.TCP,
                options: getMicroserviceConfig('NOTIFS_SERVICE_URL', 'localhost', 3003)
            }
            ])
    ],
    controllers: [CommentsController],
    providers: [CommentsService, NotificationsService],
    exports: []
})
export class CommentsModule {}
