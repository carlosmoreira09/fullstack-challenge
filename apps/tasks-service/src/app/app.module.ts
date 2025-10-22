import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {DatabaseModule} from "../../config/database.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {TaskEntity} from "../entities/task.entity";
import {ConfigModule} from "@nestjs/config";
import {CommentEntity} from "../entities/comment.entity";
import {CommentService} from "./comment/comment.service";

@Module({
  imports: [
      ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.local', '.env.docker', '.env'],
      }),
      DatabaseModule,
      TypeOrmModule.forFeature([
         TaskEntity,
         CommentEntity
      ])
  ],
  controllers: [AppController],
  providers: [AppService, CommentService],
})
export class AppModule {}
