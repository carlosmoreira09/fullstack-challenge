import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices/decorators/payload.decorator';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  UpdateCommentDto,
} from '@taskmanagerjungle/types';
import { CommentService } from './comment/comment.service';
import { TasksHistoryService } from './tasks-history/tasks-history.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly commentService: CommentService,
    private readonly tasksHistoryService: TasksHistoryService,
  ) {}

  @MessagePattern({ cmd: 'health' })
  health() {
    return {
      status: 'ok',
      service: 'tasks-service',
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('list-tasks')
  async findAll() {
    return await this.appService.findAll();
  }

  @MessagePattern('list-tasks-by-user')
  async findTasksByUser(@Payload() userId: string) {
    return await this.appService.findByUser(userId);
  }

  @MessagePattern('list-tasks-created-by-user')
  async findTasksCreatedByUser(@Payload() userId: string) {
    return await this.appService.findCreatedByUser(userId);
  }

  @MessagePattern('list-tasks-assigned-to-user')
  async findTasksAssignedToUser(@Payload() userId: string) {
    return await this.appService.findAssignedToUser(userId);
  }

  @MessagePattern('list-tasks-created-and-assigned')
  async findTasksCreatedAndAssigned(@Payload() userId: string) {
    return await this.appService.findCreatedAndAssignedToUser(userId);
  }

  @MessagePattern('get-task')
  async getTask(@Payload() taskId: string) {
    return await this.appService.findOne(taskId);
  }
  @MessagePattern('create-task')
  async createTask(@Payload() createTask: CreateTaskDto) {
    return await this.appService.create(createTask);
  }

  @MessagePattern('update-task')
  async updateTask(@Payload() updateTask: UpdateTaskDto) {
    return await this.appService.update(updateTask.id, updateTask);
  }

  @MessagePattern('list-comments-by-task')
  async findCommentsByTask(
    @Payload() data: { taskId: string; page?: number; limit?: number },
  ) {
    return await this.commentService.findByTask(
      data.taskId,
      data.page || 1,
      data.limit || 10,
    );
  }

  @MessagePattern('get-comment')
  async getComment(@Payload() id: string) {
    return await this.commentService.findOne(id);
  }

  @MessagePattern('create-comment')
  async createComment(@Payload() createComment: CreateCommentDto) {
    if (!createComment.authorId) {
      throw new Error('Author ID is required.');
    }
    return await this.commentService.create(
      createComment,
      createComment.authorId,
    );
  }

  @MessagePattern('update-comment')
  async updateComment(@Payload() data: { id: string } & UpdateCommentDto) {
    return await this.commentService.update(data.id, data);
  }

  @MessagePattern('delete-comment')
  async deleteComment(@Payload() id: string) {
    return await this.commentService.delete(id);
  }

  @MessagePattern('list-history-by-task')
  async findHistoryByTask(@Payload() taskId: string) {
    return await this.tasksHistoryService.findByTask(taskId);
  }
}
