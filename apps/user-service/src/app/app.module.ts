import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../../config/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../entities/user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.docker', '.env'],
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([UsersEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
