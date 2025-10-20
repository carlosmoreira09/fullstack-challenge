import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'health' })
  async health() {
    return {
      status: 'ok',
      service: 'notifications-service',
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
