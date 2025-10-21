import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CreateUserDto, UpdateUserDto} from "@taskmanagerjungle/types";

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
    async getUserProfile(@Payload() userId: string) {
      return await this.appService.findOne(userId);
    }

    @MessagePattern("list-users")
    async getAllUsers() {
      return await this.appService.findAll();
    }

    @MessagePattern("create-user")
    async createUser(@Payload() userData: CreateUserDto) {
        return await this.appService.create(userData);
    }
    @MessagePattern("update-user")
    async updateUser(@Payload() userData: UpdateUserDto) {
        return await this.appService.update(userData.id, userData);
    }
}
