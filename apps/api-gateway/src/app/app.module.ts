import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {AuthModule} from "./auth/auth.module";
import {CommentsModule} from "./comments/comments.module";
import {NotificationsModule} from "./notifications/notifications.module";
import {TasksModule} from "./tasks/tasks.module";
import {UsersModule} from "./user/users.module";
import {ConfigModule} from "@nestjs/config";
import {APP_GUARD} from "@nestjs/core";
import {ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler";
import {HealthModule} from "./health/health.module";

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
      HealthModule,
      CommentsModule,
      NotificationsModule,
      TasksModule,
      UsersModule
  ],
  controllers: [AppController],
  providers: [AppService,
      {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
      },],
})
export class AppModule {}
