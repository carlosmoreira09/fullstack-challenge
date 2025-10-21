import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { CreateCommentDto, UpdateCommentDto } from '@taskmanagerjungle/types';
import { CommentEntity } from '../../entities/comment.entity';

@Injectable()
export class CommentService {

    constructor(
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>,
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
        return await this.commentRepository.save(addTask)
    }

    async update(id: string, updateTask: UpdateCommentDto) {
        const task = await this.findOne(id)
        if(!task) {
            throw new Error("Task not found.");
        }

        return await this.commentRepository.update(id, updateTask)
     }

    async delete(id: string) {
        return await this.commentRepository.delete(id);
    }

}
