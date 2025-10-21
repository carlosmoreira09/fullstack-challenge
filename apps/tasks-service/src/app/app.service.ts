import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import {Repository} from "typeorm";
import { TaskEntity } from '../entities/task.entity';
import {CreateTaskDto, TaskPriority, TaskStatus, UpdateTaskDto} from "@taskmanagerjungle/types";

@Injectable()
export class AppService {

    constructor(
        @InjectRepository(TaskEntity)
        private readonly taskRepository: Repository<TaskEntity>,
    ) {}

    async findAll() {
        return await this.taskRepository.find();
    }

    async findOne(id: string) {
        return await this.taskRepository.findOne({ where: { id: id } });
    }

    async findByCreator(userId: string) {
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


    async create(createTask: CreateTaskDto) {
        const addTask = this.taskRepository.create(createTask)
        return await this.taskRepository.save(addTask)
    }

    async update(id: string, updateTask: UpdateTaskDto) {
        const task = await this.findOne(id)
        if(!task) {
            throw new Error("Task not found.");
        }

        return await this.taskRepository.update(id, updateTask)
    }

    async delete(id: string) {
        return await this.taskRepository.delete(id);
    }

}
