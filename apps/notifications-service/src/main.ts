import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const rabbitmqUrl =
    process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'notifications_queue',
      queueOptions: {
        durable: true,
      },
      noAck: false,
      persistent: true,
    },
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3003,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3006);

  Logger.log('Notifications Service is running on:');
  Logger.log('- HTTP/WebSocket: http://localhost:3006');
  Logger.log(
    `- RabbitMQ Microservice: ${rabbitmqUrl} (queue: notifications_queue)`,
  );
}
void bootstrap();
