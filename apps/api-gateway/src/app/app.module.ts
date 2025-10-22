import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ClientsModule} from "@nestjs/microservices/module/clients.module";
import {Transport} from "@nestjs/microservices";
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import {TaskController} from "./tasks/task.controller";
import {CommentController} from "./comments/comment.controller";
import {TasksHistoryController} from "./tasks/tasks-history.controller";

@Module({
  imports: [
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
              name: 'NOTIFICATIONS_SERVICE',
              transport: Transport.TCP,
              options: {
                  host: '127.0.0.1',
                  port: 3003
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
          }
      ])
  ],
  controllers: [AppController, AuthController, UserController, HealthController, TaskController, CommentController, TasksHistoryController],
  providers: [AppService, HealthService],
})
export class AppModule {}
