import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CreateUserDto} from "../dto/create-user.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

    @MessagePattern({ cmd: 'health' })
    async health() {
        return {
            status: 'ok',
            service: 'users-service',
            message: 'Service is healthy',
            timestamp: new Date().toISOString(),
        };
    }

    @MessagePattern("user-profile")
    async getUserProfile(@Payload() userId: number) {
      return await this.appService.findOne(userId);
    }

    @MessagePattern("get-all-users")
    async getAllUsers() {
      return await this.appService.findAll();
    }

    @MessagePattern("create-user")
    async createUser(@Payload() userData: CreateUserDto) {
        return await this.appService.create(userData);
    }
}
