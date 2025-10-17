import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
