import {Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import {ChannelWrapper} from 'amqp-connection-manager';
import {ConfirmChannel} from 'amqplib';
import {CreateNotificationsDto, NotificationDTO, NotificationStatus, NotificationType} from "@taskmanagerjungle/types";
import {TaskEntity} from "../entities/task.entity";

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQService.name);
    private connection: amqp.AmqpConnectionManager;
    private channelWrapper: ChannelWrapper;
    private readonly exchange = 'tasks_exchange';
    
    async onModuleInit() {
        await this.connect();
    }

    async onModuleDestroy() {
        await this.disconnect();
    }

    private async connect() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
            
            this.logger.log(`Connecting to RabbitMQ: ${rabbitmqUrl}`);
            
            this.connection = amqp.connect([rabbitmqUrl], {
                heartbeatIntervalInSeconds: 30,
                reconnectTimeInSeconds: 2,
            });

            this.connection.on('connect', () => {
                this.logger.log('Connected  RabbitMQ');
            });

            this.connection.on('disconnect', (err) => {
                this.logger.error('Disconnected RabbitMQ', err);
            });

            this.channelWrapper = this.connection.createChannel({
                setup: async (channel: ConfirmChannel) => {
                    await channel.assertExchange(this.exchange, 'topic', { durable: true });
                    this.logger.log(`Exchanged "${this.exchange}" asserted`);
                },
            });

            await this.channelWrapper.waitForConnect();
            this.logger.log('RabbitMQ channel ready');
        } catch (error) {
            this.logger.error('Failed to connect to RabbitMQ', error);
            throw error;
        }
    }

    private async disconnect() {
        try {
            if (this.channelWrapper) {
                await this.channelWrapper.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.logger.log('Disconnected from RabbitMQ');
        } catch (error) {
            this.logger.error('Error disconnecting from RabbitMQ', error);
        }
    }

    async publishEvent(routingKey: string, message: any): Promise<void> {
        try {
            if (!this.channelWrapper) {
                throw new Error('RabbitMQ channel not initialized');
            }

            await this.channelWrapper.publish(
                this.exchange,
                routingKey,
                Buffer.from(JSON.stringify(message)),
                {
                    persistent: true,
                    contentType: 'application/json',
                    timestamp: Date.now(),
                }
            );

            this.logger.log(`Event published: ${routingKey}`);
        } catch (error) {
            this.logger.error(`Failed to publish event: ${routingKey}`, error);
            throw error;
        }
    }

    async publishTaskCreated(task: TaskEntity): Promise<void> {
        const createNotification: CreateNotificationsDto = {
            userId: task.createdById,
            payload: task.description,
            status: NotificationStatus.UNREAD,
            title: task.title,
            readAt: null,
            type: NotificationType.TASK_ASSIGNED,
        }
        await this.publishEvent('task.created', {
            eventType: 'task.created',
            timestamp: new Date().toISOString(),
            data: createNotification,
        });
    }

    async publishTaskUpdated(task: any): Promise<void> {
        await this.publishEvent('task.updated', {
            eventType: 'task.updated',
            timestamp: new Date().toISOString(),
            data: task,
        });
    }

    async publishCommentCreated(comment: any): Promise<void> {
        await this.publishEvent('task.comment.created', {
            eventType: 'task.comment.created',
            timestamp: new Date().toISOString(),
            data: comment,
        });
    }
}
