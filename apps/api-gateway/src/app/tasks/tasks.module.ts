import {
    Module
} from '@nestjs/common';
import {ClientsModule} from "@nestjs/microservices/module/clients.module";
import {Transport} from "@nestjs/microservices";
import {TasksController} from "./tasks.controller";
import {TasksHistoryController} from "./tasks-history.controller";
import {TasksService} from "./tasks.service";
import {NotificationsModule} from "../notifications/notifications.module";
import {AuthModule} from "../auth/auth.module";



@Module({
    imports: [
        AuthModule,
        NotificationsModule,
        ClientsModule.register([
            {
                name: 'TASKS_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3004
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
                name: 'USERS_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3005
                }
            }
        ])
    ],
    controllers: [TasksController, TasksHistoryController],
    providers: [TasksService],
    exports: []
})
export class TasksModule {}
