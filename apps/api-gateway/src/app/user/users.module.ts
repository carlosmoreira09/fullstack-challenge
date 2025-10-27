import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices/module/clients.module';
import { Transport } from '@nestjs/microservices';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { getMicroserviceConfig } from '../../helpers/microservice.helper';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: getMicroserviceConfig('USER_SERVICE_URL', 'localhost', 3005),
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: getMicroserviceConfig('AUTH_SERVICE_URL', 'localhost', 3002),
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [],
})
export class UsersModule {}
