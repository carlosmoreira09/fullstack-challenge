import {
    Module
} from '@nestjs/common';
import {HealthController} from "./health.controller";
import {HealthService} from "./health.service";
import {Transport, ClientsModule} from "@nestjs/microservices";



@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'AUTH_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
                    queue: 'auth_queue',
                    queueOptions: {
                        durable: true
                    },
                    persistent: true
                }
            },
            {
                name: 'NOTIFICATIONS_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
                    queue: 'notifications_queue',
                    queueOptions: {
                        durable: true
                    },
                    persistent: true
                }
            },
            {
                name: 'TASKS_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
                    queue: 'tasks_queue',
                    queueOptions: {
                        durable: true
                    },
                    persistent: true
                }
            },
            {
                name: 'USERS_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3005
                }
            }
        ])
    ],
    controllers: [HealthController],
    providers: [HealthService],
    exports: []
})
export class HealthModule {}
