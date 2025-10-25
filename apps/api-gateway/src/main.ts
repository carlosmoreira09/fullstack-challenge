import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {Logger, ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    const port = process.env.PORT ?? 3001
  app.setGlobalPrefix('api')
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
        allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
    ],
        exposedHeaders: ['Content-Disposition'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(port);
    Logger.log(`🚀 API Gateway running on http://localhost:${port}`);
    Logger.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
