import {
    Inject, Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateCommentDto, UpdateCommentDto, UserDto } from '@taskmanagerjungle/types';
import {AuthGuard} from "../../guards/auth/auth.guard";

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) {}

  async createNotifications(createCommentDto: CreateCommentDto, userId: string) {
    return await firstValueFrom(this.notificationsClient.send('create-notification', {...createCommentDto, userId: userId}));
  }
  async markAsRead(notificationId: string, userId: string){
    return await firstValueFrom(this.notificationsClient.send('mark-as-read', {notificationId, userId}));
  }
  async markAllAsRead(userId: string){
      return await firstValueFrom(this.notificationsClient.send('mark-all-as-read', { userId }));
  }
}
