import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import {TaskEntity} from "../entities/task.entity";
import {Repository} from "typeorm";
import {CreateTaskDto} from "../dto/create-task.dto";
import {TaskPriority, TaskStatus} from "../enum/tasks.enum";

@Injectable()
export class AppService {

    constructor(
        @InjectRepository(TaskEntity)
        private readonly taskRepository: Repository<TaskEntity>,
    ) {}

    async findAll() {
        return await this.taskRepository.find();
    }

    async findOne(id: number) {
        return await this.taskRepository.findOne({ where: { id: id } });
    }

    async findByCreator(userId: number) {
        return await this.taskRepository.find({ where: { createdById: userId } });
    }

    async findByAssignee(assigneeId: number) {
        return await this.taskRepository
            .createQueryBuilder('task')
            .where(':assigneeId = ANY(task.assignees)', { assigneeId })
            .getMany();
    }

    async findByAssigneeAndStatus(assigneeId: number, status: TaskStatus) {
        return await this.taskRepository
            .createQueryBuilder('task')
            .where(':assigneeId = ANY(task.assignees)', { assigneeId })
            .andWhere('task.status = :status', { status })
            .getMany();
    }

    async findByAssigneeAndPriority(assigneeId: number, priority: TaskPriority) {
        return await this.taskRepository
            .createQueryBuilder('task')
            .where(':assigneeId = ANY(task.assignees)', { assigneeId })
            .andWhere('task.priority = :priority', { priority })
            .getMany();
    }


    async create(task: CreateTaskDto) {

        const newTask = this.taskRepository.create(task);

        return await this.taskRepository.save(newTask);
    }

    async update(id: string, task: TaskEntity) {
        return await this.taskRepository.update(id, task);
    }

    async delete(id: string) {
        return await this.taskRepository.delete(id);
    }

}
