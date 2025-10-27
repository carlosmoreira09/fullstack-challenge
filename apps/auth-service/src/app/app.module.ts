import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../../config/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from '../entities/auth.entity';
import { JwtModule } from '@nestjs/jwt';
import { RefreshToken } from '../entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.docker', '.env'],
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '15m',
      },
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([AuthEntity, RefreshToken]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
