import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {DatabaseModule} from "../../config/database.module";
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
      DatabaseModule,
      ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.local', '.env.docker', '.env'],
      }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
