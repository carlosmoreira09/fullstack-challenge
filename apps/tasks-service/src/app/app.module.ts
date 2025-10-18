import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {DatabaseModule} from "../../config/database.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {TaskEntity} from "../entities/task.entity";
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
      ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.local', '.env.docker', '.env'],
      }),
      DatabaseModule,
      TypeOrmModule.forFeature([
         TaskEntity
      ])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
