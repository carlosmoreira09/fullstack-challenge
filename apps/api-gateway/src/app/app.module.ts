import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ClientsModule} from "@nestjs/microservices/module/clients.module";
import {Transport} from "@nestjs/microservices";
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';

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
  controllers: [AppController, AuthController, UserController],
  providers: [AppService],
})
export class AppModule {}
