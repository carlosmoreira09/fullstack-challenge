import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices/module/clients.module';
import { Transport } from '@nestjs/microservices';
import { TasksController } from './tasks.controller';
import { TasksHistoryController } from './tasks-history.controller';
import { TasksService } from './tasks.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';
import { getMicroserviceConfig } from '../../helpers/microservice.helper';

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    ClientsModule.register([
      {
        name: 'TASKS_SERVICE',
        transport: Transport.TCP,
        options: getMicroserviceConfig('TASKS_SERVICE_URL', 'localhost', 3004),
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: getMicroserviceConfig('AUTH_SERVICE_URL', 'localhost', 3002),
      },
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: getMicroserviceConfig('USER_SERVICE_URL', 'localhost', 3005),
      },
    ]),
  ],
  controllers: [TasksController, TasksHistoryController],
  providers: [TasksService],
  exports: [],
})
export class TasksModule {}
