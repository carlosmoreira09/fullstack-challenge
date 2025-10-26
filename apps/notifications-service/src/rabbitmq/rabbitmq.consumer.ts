import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { NotificationsGateway } from '../websocket/websocket.gateway';
import { AppService } from '../app/app.service';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQConsumer.name);
    private connection: amqp.AmqpConnectionManager;
    private channelWrapper: ChannelWrapper;
    private readonly exchange = 'tasks_exchange';

    constructor(
        private readonly websocketGateway: NotificationsGateway,
        private readonly notificationService: AppService
    ) {}

    async onModuleInit() {
        await this.connect();
        await this.setupConsumers();
    }

    async onModuleDestroy() {
        await this.disconnect();
    }

    private async connect() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
            
            this.logger.log(`Connecting to RabbitMQ at ${rabbitmqUrl}`);
            
            this.connection = amqp.connect([rabbitmqUrl], {
                heartbeatIntervalInSeconds: 30,
                reconnectTimeInSeconds: 2,
            });

            this.connection.on('connect', () => {
                this.logger.log('Connected to RabbitMQ');
            });

            this.connection.on('disconnect', (err) => {
                this.logger.error('Disconnected from RabbitMQ', err);
            });

            this.channelWrapper = this.connection.createChannel({
                setup: async (channel: ConfirmChannel) => {
                    await channel.assertExchange(this.exchange, 'topic', { durable: true });
                    this.logger.log(`Exchange "${this.exchange}" asserted`);
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

    private async setupConsumers() {
        try {
            await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
                const taskCreatedQueue = 'task_created_notifications_queue';
                await channel.assertQueue(taskCreatedQueue, { durable: true });
                await channel.bindQueue(taskCreatedQueue, this.exchange, 'task.created');
                
                await channel.consume(taskCreatedQueue, (msg: ConsumeMessage | null) => {
                    if (msg) {
                        this.handleTaskCreated(msg, channel);
                    }
                });
                
                this.logger.log(`Consumer setup for task.created on queue: ${taskCreatedQueue}`);

                const taskUpdatedQueue = 'task_updated_notifications_queue';
                await channel.assertQueue(taskUpdatedQueue, { durable: true });
                await channel.bindQueue(taskUpdatedQueue, this.exchange, 'task.updated');
                
                await channel.consume(taskUpdatedQueue, (msg: ConsumeMessage | null) => {
                    if (msg) {
                        this.handleTaskUpdated(msg, channel);
                    }
                });
                
                this.logger.log(`Consumer setup for task.updated on queue: ${taskUpdatedQueue}`);

                const commentCreatedQueue = 'task_comment_created_notifications_queue';
                await channel.assertQueue(commentCreatedQueue, { durable: true });
                await channel.bindQueue(commentCreatedQueue, this.exchange, 'task.comment.created');
                
                await channel.consume(commentCreatedQueue, (msg: ConsumeMessage | null) => {
                    if (msg) {
                        this.handleCommentCreated(msg, channel);
                    }
                });
                
                this.logger.log(`Consumer setup for task.comment.created on queue: ${commentCreatedQueue}`);
            });

            this.logger.log('All consumers setup completed');
        } catch (error) {
            this.logger.error('Failed to setup consumers', error);
            throw error;
        }
    }

    private async handleTaskCreated(msg: ConsumeMessage, channel: ConfirmChannel) {
        try {
            const content = msg.content.toString();
            const event = JSON.parse(content);
            
            this.logger.log(`Received task.created event for task: ${event.data?.id}`);
            this.websocketGateway.emitTaskCreated(event.data);
            
            channel.ack(msg);
        } catch (error) {
            this.logger.error('Error handling task.created event', error);
            channel.nack(msg, false, true);
        }
    }

    private async handleTaskUpdated(msg: ConsumeMessage, channel: ConfirmChannel) {
        try {
            const content = msg.content.toString();
            const event = JSON.parse(content);
            this.logger.log(`Received task.updated event for task: ${event.data?.id}`);

            this.websocketGateway.emitTaskUpdated(event.data);
            
            channel.ack(msg);
        } catch (error) {
            this.logger.error('Error handling task.updated event', error);
            channel.nack(msg, false, true);
        }
    }

    private async handleCommentCreated(msg: ConsumeMessage, channel: ConfirmChannel) {
        try {
            const content = msg.content.toString();
            const event = JSON.parse(content);
            
            this.logger.log(`Received task.comment.created event for comment: ${event.data?.id}`);

            this.websocketGateway.emitCommentNew(event.data);
            
            channel.ack(msg);
        } catch (error) {
            this.logger.error('Error handling task.comment.created event', error);
            channel.nack(msg, false, true);
        }
    }
}
