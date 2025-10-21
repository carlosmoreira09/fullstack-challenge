import {Body, Controller, Get, Inject, Post, Put} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {firstValueFrom} from "rxjs";

@Controller('tasks')
export class TaskController {
    constructor(
        @Inject("TASKS_SERVICE")
        private readonly taskClient: ClientProxy,
    ) {}

    @Get()
    async findAll() {
        return await firstValueFrom(this.taskClient.send('list-tasks', {}));
    }

    @Post()
    async createTask(@Body() task: any) {
        return await firstValueFrom(this.taskClient.send('create-task', task));
    }

    @Put()
    async updateTask(@Body() task: any) {
        return await firstValueFrom(this.taskClient.send('update-task', task));
    }
}
