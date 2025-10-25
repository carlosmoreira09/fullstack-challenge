import {
    Module
} from '@nestjs/common';
import {ClientsModule} from "@nestjs/microservices/module/clients.module";
import {Transport} from "@nestjs/microservices";
import {TasksController} from "./tasks.controller";
import {TasksHistoryController} from "./tasks-history.controller";



@Module({
    imports: [
        ClientsModule.register([
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
    controllers: [TasksController, TasksHistoryController],
    providers: [],
    exports: []
})
export class TasksModule {}
