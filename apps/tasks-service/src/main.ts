import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { Logger } from "@nestjs/common/services/logger.service";
import {AppModule} from "./app/app.module";

async function bootstrap() {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
    const tcpPort = parseInt(process.env.MICROSERVICE_PORT as string) || 3004;
    
    const app = await NestFactory.create(AppModule);
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [rabbitmqUrl],
            queue: 'tasks_queue',
            queueOptions: {
                durable: true
            },
            noAck: false,
            persistent: true
        }
    });
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.TCP,
        options: {
            host: "0.0.0.0",
            port: tcpPort,
        },
    });

    await app.startAllMicroservices();
    await app.listen(3008);

    Logger.log('Tasks Service is running on:');
    Logger.log('- HTTP: http://localhost:3008');
    Logger.log(`- TCP: 0.0.0.0:${tcpPort}`);
    Logger.log(`- RabbitMQ: ${rabbitmqUrl} (queue: tasks_queue)`);
}

bootstrap();
