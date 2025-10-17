import {NestFactory} from '@nestjs/core';
import {AppModule} from './app/app.module';
import { Logger} from "@nestjs/common";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.TCP,
      options: {
          host: '127.0.0.1',
              port: 3001
      }
  });
  await app.listen();

  Logger.log("App running in TCP port 3001")
}
bootstrap().then();
