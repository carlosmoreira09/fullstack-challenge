import {Body, Controller, Get, Param, Post, Put, Query, UseGuards} from "@nestjs/common";
import {CreateTaskDto, UpdateTaskDto, TaskDto} from "@taskmanagerjungle/types";
import {JwtAuthGuard} from "../../guards/jwt-auth/jwt-auth.guard";
import {TasksService} from "./tasks.service";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController {
    constructor(private readonly taskService: TasksService) {}

    @Get()
    @ApiOperation({ summary: 'Get all tasks', description: 'Retrieve list of all tasks' })
    @ApiResponse({ status: 200, description: 'Tasks list retrieved', type: [TaskDto] })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll() {
        return await this.taskService.findAll()
    }
    @Get('user/:userId')
    @ApiOperation({ summary: 'Get tasks by user ID', description: 'Retrieve tasks created by or assigned to a specific user' })
    @ApiParam({ name: 'userId', description: 'User UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiQuery({ name: 'includeAssigned', required: false, description: 'Include tasks assigned to user', example: 'true' })
    @ApiResponse({ status: 200, description: 'User tasks retrieved', type: [TaskDto] })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findByUserId(
        @Param('userId') userId: string,
        @Query('includeAssigned') includeAssigned?: string
    ) {
        return await this.taskService.findByUserId(userId, includeAssigned)
    }

    @Get(':taskId')
    @ApiOperation({ summary: 'Get task by ID', description: 'Retrieve a specific task by its ID' })
    @ApiParam({ name: 'taskId', description: 'Task UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiResponse({ status: 200, description: 'Task retrieved', type: TaskDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async findOne(@Param('taskId') taskId: string) {
        return await this.taskService.findOne(taskId)
    }

    @Post()
    @ApiOperation({ summary: 'Create new task', description: 'Create a new task in the system' })
    @ApiBody({ type: CreateTaskDto })
    @ApiResponse({ status: 201, description: 'Task created successfully', type: TaskDto })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createTask(@Body() task: CreateTaskDto) {
        return await this.taskService.createTask(task)
    }

    @Put()
    @ApiOperation({ summary: 'Update task', description: 'Update an existing task' })
    @ApiBody({ type: UpdateTaskDto })
    @ApiResponse({ status: 200, description: 'Task updated successfully', type: TaskDto })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async updateTask(@Body() task: any) {
        const updateTask: UpdateTaskDto = {
            ...task,
            id: task.id
        }
        return await this.taskService.updateTask(updateTask)
    }

    @Get(':id/comments')
    @ApiOperation({ summary: 'Get task comments', description: 'Retrieve all comments for a specific task' })
    @ApiParam({ name: 'id', description: 'Task UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number', example: '1' })
    @ApiQuery({ name: 'size', required: false, description: 'Page size', example: '10' })
    @ApiResponse({ status: 200, description: 'Task comments retrieved' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async getTaskComments(
        @Param('id') taskId: string,
        @Query('page') page?: string,
        @Query('size') size?: string
    ) {
        return await this.taskService.getTaskComments(taskId, page, size)
    }
}
