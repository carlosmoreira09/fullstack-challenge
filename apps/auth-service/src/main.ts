import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const rabbitmqUrl =
    process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';

  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'auth_queue',
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
      port: 3002,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3007);

  Logger.log('Auth Service is running on:');
  Logger.log('- HTTP: http://localhost:3007');
  Logger.log('- TCP: 0.0.0.0:3002');
  Logger.log(`- RabbitMQ: ${rabbitmqUrl} (queue: auth_queue)`);
}
void bootstrap();
