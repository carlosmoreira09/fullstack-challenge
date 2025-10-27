import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TaskEntity } from '../entities/task.entity';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) {}

  publishEvent(eventPattern: string, data: unknown): void {
    try {
      this.logger.log(`Attempting to emit event: ${eventPattern}`);
      this.logger.debug(`Event data: ${JSON.stringify(data, null, 2)}`);
      this.notificationsClient.emit(eventPattern, data);
      this.logger.log(`Event successfully emitted: ${eventPattern}`);
    } catch (error) {
      this.logger.error(`Failed to emit event: ${eventPattern}`, error);
      throw error;
    }
  }

  publishTaskCreated(task: TaskEntity): void {
    this.publishEvent('task.created', {
      eventType: 'task.created',
      timestamp: new Date().toISOString(),
      data: task,
      notifications: [],
    });
  }

  publishTaskUpdated(task: TaskEntity): void {
    this.publishEvent('task.updated', {
      eventType: 'task.updated',
      timestamp: new Date().toISOString(),
      data: task,
      notifications: [],
    });
  }

  publishCommentCreated(comment: unknown, task: TaskEntity | null): void {
    this.publishEvent('task.comment.created', {
      eventType: 'task.comment.created',
      timestamp: new Date().toISOString(),
      data: comment,
      task: task ? { id: task.id, title: task.title } : null,
    });
  }
}
