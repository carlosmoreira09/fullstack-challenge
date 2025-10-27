import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsEntity } from '../entities/notifications.entity';
import { Repository } from 'typeorm';
import {
  CreateNotificationsDto,
  NotificationStatus,
} from '@taskmanagerjungle/types';
import { NotificationsGateway } from '../websocket/websocket.gateway';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(NotificationsEntity)
    private readonly notifcationsRepository: Repository<NotificationsEntity>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(userId: string) {
    return await this.notifcationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
  async create(notificationData: CreateNotificationsDto) {
    const createNotification =
      this.notifcationsRepository.create(notificationData);
    const createdNotification =
      await this.notifcationsRepository.save(createNotification);
    this.notificationsGateway.emitNotification(
      createdNotification.userId,
      createdNotification,
    );

    return createdNotification;
  }

  async markAsRead(notificationId: string) {
    const notification = await this.notifcationsRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.read_at = new Date();
    notification.status = NotificationStatus.READ;
    return this.notifcationsRepository.save(notification);
  }

  async markAllAsRead(userId: string) {
    const result = await this.notifcationsRepository
      .createQueryBuilder()
      .update(NotificationsEntity)
      .set({ read_at: new Date(), status: NotificationStatus.READ })
      .where('"userId" = :userId AND "read_at" IS NULL', { userId })
      .execute();

    return { updated: result.affected };
  }

  async countUnread(userId: string) {
    return await this.notifcationsRepository.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });
  }
}
