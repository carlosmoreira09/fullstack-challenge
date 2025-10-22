import {Injectable, Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { CreateCommentDto, TaskHistoryAction, UpdateCommentDto } from '@taskmanagerjungle/types';
import { CommentEntity } from '../../entities/comment.entity';
import { TasksHistoryService } from '../tasks-history/tasks-history.service';

@Injectable()
export class CommentService {

    constructor(
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>,
        private readonly tasksHistoryService: TasksHistoryService,
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
    async findByTask(taskId: string) {
        return await this.commentRepository.find({ where: { taskId: taskId } });
    }

    async findByCreated(authorId: string) {
        return await this.commentRepository.find({
            where: {
                authorId: authorId
            }
        })
    }


    async create(createTask: CreateCommentDto) {
        const addTask = this.commentRepository.create({
            ...createTask,
            task: { id: createTask.taskId }
        })
        const newComment = await this.commentRepository.save(addTask)

        try {
            await this.tasksHistoryService.create({
                taskId: createTask.taskId,
                userId: createTask.authorId,
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
