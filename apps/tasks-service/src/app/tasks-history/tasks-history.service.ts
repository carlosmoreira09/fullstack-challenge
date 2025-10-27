import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateTaskHistoryDto,
  UpdateTaskHistoryDto,
} from '@taskmanagerjungle/types';
import { TaskHistoryEntity } from '../../entities/task-history.entity';

@Injectable()
export class TasksHistoryService {
  constructor(
    @InjectRepository(TaskHistoryEntity)
    private readonly taskHistoryRepository: Repository<TaskHistoryEntity>,
  ) {}

  async findAll() {
    return await this.taskHistoryRepository.find();
  }

  async findOneByTask(taskId: string) {
    return await this.taskHistoryRepository.findOne({
      where: { taskId: taskId },
    });
  }

  async findByTask(taskId: string) {
    return await this.taskHistoryRepository.find({ where: { taskId: taskId } });
  }

  async findByUser(userId: string) {
    return await this.taskHistoryRepository.find({ where: { userId: userId } });
  }

  async findOne(id: string) {
    return await this.taskHistoryRepository.findOne({ where: { id: id } });
  }

  async create(createAssignment: CreateTaskHistoryDto) {
    const taskAssignment = this.taskHistoryRepository.create(createAssignment);
    return await this.taskHistoryRepository.save(taskAssignment);
  }

  async update(updateAssignment: UpdateTaskHistoryDto) {
    const assignment = await this.findOne(updateAssignment.id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    const updateObject = this.taskHistoryRepository.create({
      ...assignment,
      ...updateAssignment,
    });

    return await this.taskHistoryRepository.save(updateObject);
  }
}
