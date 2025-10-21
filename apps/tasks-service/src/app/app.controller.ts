import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import {Payload} from "@nestjs/microservices/decorators/payload.decorator";
import {CreateTaskDto} from "../dto/tasks/create-task.dto";
import {UpdateTaskDto} from "../dto/tasks/update-task.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'health' })
  async health() {
    return {
      status: 'ok',
      service: 'tasks-service',
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('list-tasks')
    async findAll() {
      return await this.appService.findAll()
  }
    @MessagePattern('create-task')
    async createTask(@Payload() createTask: CreateTaskDto) {
        return await this.appService.create(createTask);
    }

    @MessagePattern('update-task')
    async updateTask(@Payload() updateTask: UpdateTaskDto) {
        return await this.appService.update(updateTask.id, updateTask)
    }
}
