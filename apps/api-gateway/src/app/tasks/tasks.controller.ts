import {Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards} from "@nestjs/common";
import {CreateTaskDto, UpdateTaskDto} from "@taskmanagerjungle/types";
import {AuthGuard} from "../../guards/auth/auth.guard";
import {TasksService} from "./tasks.service";

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
    constructor(private readonly taskService: TasksService) {}

    @Get()
    async findAll() {
        return await this.taskService.findAll()
    }
    @Get('user/:userId')
    async findByUserId(
        @Param('userId') userId: string,
        @Query('includeAssigned') includeAssigned?: string
    ) {
        return await this.taskService.findByUserId(userId, includeAssigned)
    }

    @Get(':taskId')
    async findOne(@Param('taskId') taskId: string) {
        return await this.taskService.findOne(taskId)
    }

    @Post()
    async createTask(@Body() task: CreateTaskDto) {
        return await this.taskService.createTask(task)
    }

    @Put()
    async updateTask(@Body() task: any) {
        const updateTask: UpdateTaskDto = {
            ...task,
            id: task.id
        }
        return await this.taskService.updateTask(updateTask)
    }

    @Get(':id/comments')
    async getTaskComments(
        @Param('id') taskId: string,
        @Query('page') page?: string,
        @Query('size') size?: string
    ) {
        return await this.taskService.getTaskComments(taskId, page, size)
    }
}
