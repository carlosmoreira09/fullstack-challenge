import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {DatabaseModule} from "../../config/database.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {TaskEntity} from "../entities/task.entity";
import {ConfigModule} from "@nestjs/config";
import {CommentEntity} from "../entities/comment.entity";
import {CommentService} from "./comment/comment.service";
import {TaskHistoryEntity} from "../entities/task-history.entity";
import {TasksHistoryService} from "./tasks-history/tasks-history.service";
import {TaskAssignmentEntity} from "../entities/task-assignment.entity";
import {TasksAssignmentService} from "./tasks-assignment/tasks-assignment.service";
import {RabbitMQModule} from "../rabbitmq/rabbitmq.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env.docker', '.env'],
        }),
        DatabaseModule,
        RabbitMQModule,
        TypeOrmModule.forFeature([
            TaskEntity,
            CommentEntity,
            TaskHistoryEntity,
            TaskAssignmentEntity
        ])
    ],
    controllers: [AppController],
    providers: [AppService, CommentService, TasksHistoryService, TasksAssignmentService],
})
export class AppModule {}
