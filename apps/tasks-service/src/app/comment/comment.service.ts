import {Injectable, Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { CreateCommentDto, TaskHistoryAction, UpdateCommentDto } from '@taskmanagerjungle/types';
import { CommentEntity } from '../../entities/comment.entity';
import { TasksHistoryService } from '../tasks-history/tasks-history.service';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { TaskEntity } from '../../entities/task.entity';

@Injectable()
export class CommentService {

    constructor(
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>,
        @InjectRepository(TaskEntity)
        private readonly taskRepository: Repository<TaskEntity>,
        private readonly tasksHistoryService: TasksHistoryService,
        private readonly rabbitMQService: RabbitMQService,
    ) {}

    async findAll() {
        return await this.commentRepository.find();
    }

    async findOne(id: string) {
        return await this.commentRepository.findOne({ where: { id: id } });
    }
    async findOneByTask(taskId: string) {
        return await this.commentRepository.findOne({ where: { taskId: taskId } });
    }
    async findByTask(taskId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        
        const [comments, total] = await this.commentRepository.findAndCount({
            where: { taskId: taskId },
            order: { createdAt: 'DESC' },
            skip,
            take: limit
        });

        return {
            data: comments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findByCreated(authorId: string) {
        return await this.commentRepository.find({
            where: {
                authorId: authorId
            }
        })
    }


    async create(createTask: CreateCommentDto, userID: string) {
        const addTask = this.commentRepository.create({
            ...createTask,
            task: { id: createTask.taskId }
        })
        const newComment = await this.commentRepository.save(addTask)

        try {
            await this.tasksHistoryService.create({
                taskId: createTask.taskId,
                userId: createTask.authorId ? createTask.authorId : userID,
                action: TaskHistoryAction.COMMENT_ADDED,
                oldValue: null,
                newValue: {
                    commentId: newComment.id,
                    content: newComment.content
                }
            });
        } catch (error) {
            Logger.error('Failed to create comment history:', error);
        }

        try {
            const task = await this.taskRepository.findOne({ where: { id: createTask.taskId } });
            await this.rabbitMQService.publishCommentCreated(newComment, task);
            Logger.log(`Published task.comment.created event for comment ${newComment.id}`);
        } catch (error) {
            Logger.error(`Failed to publish task.comment.created event for comment ${newComment.id}:`, error);
        }

        return newComment;
    }

    async update(id: string, updateTask: UpdateCommentDto) {
        const comment = await this.findOne(id)
        if(!comment) {
            throw new Error("Comment not found.");
        }

        const result = await this.commentRepository.update(id, updateTask)

        try {
            await this.tasksHistoryService.create({
                taskId: comment.taskId,
                userId: comment.authorId,
                action: TaskHistoryAction.COMMENT_UPDATED,
                oldValue: {
                    commentId: comment.id,
                    content: comment.content
                },
                newValue: {
                    commentId: comment.id,
                    content: updateTask.content
                }
            });
        } catch (error) {
            Logger.error('Failed to create comment update history:', error);
        }

        return result;
    }

    async delete(id: string) {
        const comment = await this.findOne(id);
        if (!comment) {
            throw new Error("Comment not found.");
        }

        try {
            await this.tasksHistoryService.create({
                taskId: comment.taskId,
                userId: comment.authorId,
                action: TaskHistoryAction.COMMENT_DELETED,
                oldValue: {
                    commentId: comment.id,
                    content: comment.content
                },
                newValue: null
            });
        } catch (error) {
            Logger.error('Failed to create comment deletion history:', error);
        }

        return await this.commentRepository.delete(id);
    }

}
