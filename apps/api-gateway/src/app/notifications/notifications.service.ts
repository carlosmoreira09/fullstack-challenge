import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateNotificationsDto } from '@taskmanagerjungle/types';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) {}

  async createNotifications(createNotificationDto: CreateNotificationsDto) {
    return await firstValueFrom(
      this.notificationsClient.send(
        'create-notification',
        createNotificationDto,
      ),
    );
  }
  async findAll(userId: string) {
    return await firstValueFrom(
      this.notificationsClient.send('list-notifications', { userId }),
    );
  }
  async markAsRead(notificationId: string, userId: string) {
    return await firstValueFrom(
      this.notificationsClient.send('mark-as-read', { notificationId, userId }),
    );
  }
  async markAllAsRead(userId: string) {
    return await firstValueFrom(
      this.notificationsClient.send('mark-all-as-read', { userId }),
    );
  }

  async countUnread(userId: string) {
    return await firstValueFrom(
      this.notificationsClient.send('count-unread', { userId }),
    );
  }
}
