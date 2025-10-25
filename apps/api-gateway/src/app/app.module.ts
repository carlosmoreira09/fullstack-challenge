import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ClientsModule} from "@nestjs/microservices/module/clients.module";
import {Transport} from "@nestjs/microservices";
import { AuthController } from './auth/auth.controller';
import { UsersController } from './user/users.controller';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import {TasksController} from "./tasks/tasks.controller";
import {CommentsController} from "./comments/comments.controller";
import {TasksHistoryController} from "./tasks/tasks-history.controller";
import {AuthModule} from "./auth/auth.module";
import {CommentsModule} from "./comments/comments.module";
import {NotificationsModule} from "./notifications/notifications.module";
import {TasksModule} from "./tasks/tasks.module";
import {UsersModule} from "./user/users.module";
import {ConfigModule} from "@nestjs/config";
import {APP_GUARD} from "@nestjs/core";
import {ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler";

@Module({
  imports: [
      ConfigModule.forRoot({
          isGlobal: true,
      }),
      ThrottlerModule.forRoot({
          throttlers: [{
              ttl: 1000,
              limit: 10,
          }],
      }),
      AuthModule,
      CommentsModule,
      NotificationsModule,
      TasksModule,
      UsersModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, HealthService,
      {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
      },],
})
export class AppModule {}
