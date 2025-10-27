import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateNotificationsDto } from '@taskmanagerjungle/types';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'health' })
  health() {
    return {
      status: 'ok',
      service: 'notifications-service',
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
    };
  }
  @MessagePattern('create-notification')
  async createNotification(data: CreateNotificationsDto) {
    return await this.appService.create(data);
  }

  @MessagePattern('list-notifications')
  async findAll(data: { userId: string }) {
    return await this.appService.findAll(data.userId);
  }

  @MessagePattern('mark-as-read')
  async markAsRead(data: { notificationId: string; userId: string }) {
    return await this.appService.markAsRead(data.notificationId);
  }

  @MessagePattern('mark-all-as-read')
  async markAllAsRead(data: { userId: string }) {
    return await this.appService.markAllAsRead(data.userId);
  }

  @MessagePattern('count-unread')
  async countUnread(data: { userId: string }) {
    return await this.appService.countUnread(data.userId);
  }
}
