import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {DatabaseModule} from "../../config/database.module";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {NotificationsEntity} from "../entities/notifications.entity";
import {NotificationsGateway} from "../websocket/websocket.gateway";
import {RabbitMQConsumer} from "../rabbitmq/rabbitmq.consumer";

@Module({
  imports: [
      DatabaseModule,
      ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.local', '.env.docker', '.env'],
      }),
      TypeOrmModule.forFeature([NotificationsEntity])
  ],
  controllers: [AppController],
  providers: [AppService, NotificationsGateway, RabbitMQConsumer],
})
export class AppModule {}
