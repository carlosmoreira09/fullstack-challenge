import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import {MessagePattern, Payload} from "@nestjs/microservices";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

    @MessagePattern("user-profile")
    async getUserProfile(@Payload() userId: number) {
      return await this.appService.findOne(userId);
    }
}
