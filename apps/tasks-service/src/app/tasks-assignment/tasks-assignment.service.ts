import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskAssignmentEntity } from '../../entities/task-assignment.entity';
import { Repository } from 'typeorm';
import {
  CreateTaskAssignmentDto,
  UpdateTaskAssignmentDto,
} from '@taskmanagerjungle/types';

@Injectable()
export class TasksAssignmentService {
  constructor(
    @InjectRepository(TaskAssignmentEntity)
    private readonly taskAssignmentRepository: Repository<TaskAssignmentEntity>,
  ) {}

  async findAll() {
    return await this.taskAssignmentRepository.find();
  }

  async findOneByTask(taskId: string) {
    return await this.taskAssignmentRepository.findOne({
      where: { taskId: taskId },
    });
  }
  async findByTask(taskId: string) {
    return await this.taskAssignmentRepository.find({
      where: { taskId: taskId },
    });
  }

  async findByAssigned(assignedId: string) {
    return await this.taskAssignmentRepository.find({
      where: { assignedById: assignedId },
    });
  }
  async findByUser(userId: string) {
    return await this.taskAssignmentRepository.find({
      where: { userId: userId },
    });
  }

  async findOne(id: string) {
    return await this.taskAssignmentRepository.findOne({ where: { id: id } });
  }

  async create(createAssignment: CreateTaskAssignmentDto) {
    const taskAssignment =
      this.taskAssignmentRepository.create(createAssignment);
    return await this.taskAssignmentRepository.save(taskAssignment);
  }
  async update(updateAssignment: UpdateTaskAssignmentDto) {
    const assignment = await this.findOne(updateAssignment.id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    const updateObject = this.taskAssignmentRepository.create({
      ...assignment,
      ...updateAssignment,
    });

    return await this.taskAssignmentRepository.save(updateObject);
  }

  async unassignUser(taskId: string, userId: string) {
    const assignments = await this.taskAssignmentRepository.find({
      where: { taskId, userId, isActive: true },
    });

    if (assignments.length > 0) {
      for (const assignment of assignments) {
        assignment.isActive = false;
        assignment.unassignedAt = new Date();
        await this.taskAssignmentRepository.save(assignment);
      }
    }
  }

  async getActiveAssignees(taskId: string): Promise<string[]> {
    const assignments = await this.taskAssignmentRepository.find({
      where: { taskId, isActive: true },
    });
    return assignments.map((a) => a.userId);
  }
}
