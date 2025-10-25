import {Controller, Get, UseGuards} from '@nestjs/common';
import { HealthService } from './health.service';
import {AuthGuard} from "../../guards/auth/auth.guard";

@Controller('health')
@UseGuards(AuthGuard)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async checkAllServices() {
    return this.healthService.checkAllServices();
  }

  @Get('auth')
  async checkAuthService() {
    return this.healthService.checkAuthService();
  }

  @Get('tasks')
  async checkTasksService() {
    return this.healthService.checkTasksService();
  }

  @Get('notifications')
  async checkNotificationsService() {
    return this.healthService.checkNotificationsService();
  }

  @Get('users')
  async checkUsersService() {
    return this.healthService.checkUsersService();
  }

  @Get('postgres')
  async checkPostgres() {
    return this.healthService.checkPostgres();
  }

  @Get('rabbitmq')
  async checkRabbitMQ() {
    return this.healthService.checkRabbitMQ();
  }
}
