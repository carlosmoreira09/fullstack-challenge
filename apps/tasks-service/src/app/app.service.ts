import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from "typeorm";
import {TaskEntity} from '../entities/task.entity';
import {CreateTaskDto, TaskHistoryAction, TaskPriority, TaskStatus, UpdateTaskDto} from "@taskmanagerjungle/types";
import {TasksAssignmentService} from "./tasks-assignment/tasks-assignment.service";
import {TasksHistoryService} from "./tasks-history/tasks-history.service";
import {RabbitMQService} from "../rabbitmq/rabbitmq.service";

@Injectable()
export class AppService {

    constructor(
        @InjectRepository(TaskEntity)
        private readonly taskRepository: Repository<TaskEntity>,
        private readonly taskAssignmentService: TasksAssignmentService,
        private readonly taskHistoryService: TasksHistoryService,
        private readonly rabbitMQService: RabbitMQService,
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

    async findByUser(userId: string) {
        return await this.taskRepository
            .createQueryBuilder('task')
            .where('task.createdById = :userId', { userId })
            .orWhere(':userId = ANY(task.assignees)', { userId })
            .getMany();
    }

    async findCreatedByUser(userId: string) {
        return await this.taskRepository.find({ where: { createdById: userId } });
    }

    async findAssignedToUser(userId: string) {
        return await this.taskRepository
            .createQueryBuilder('task')
            .where(':userId = ANY(task.assignees)', { userId })
            .getMany();
    }

    async findCreatedAndAssignedToUser(userId: string) {
        const createdTasks = await this.findCreatedByUser(userId);
        const assignedTasks = await this.findAssignedToUser(userId);
        const taskMap = new Map();
        [...createdTasks, ...assignedTasks].forEach(task => {
            taskMap.set(task.id, task);
        });
        
        return Array.from(taskMap.values());
    }

    async findByAssignee(assigneeId: string) {
        return await this.taskRepository
            .createQueryBuilder('task')
            .where(':assigneeId = ANY(task.assignees)', { assigneeId })
            .getMany();
    }

    async findByAssigneeAndStatus(assigneeId: string, status: TaskStatus) {
        return await this.taskRepository
            .createQueryBuilder('task')
            .where(':assigneeId = ANY(task.assignees)', { assigneeId })
            .andWhere('task.status = :status', { status })
            .getMany();
    }

    async findByAssigneeAndPriority(assigneeId: string, priority: TaskPriority) {
        return await this.taskRepository
            .createQueryBuilder('task')
            .where(':assigneeId = ANY(task.assignees)', { assigneeId })
            .andWhere('task.priority = :priority', { priority })
            .getMany();
    }


    async create(createTask: CreateTaskDto) {
        const addTask = this.taskRepository.create(createTask)

        const newTask = await this.taskRepository.save(addTask)

        if(newTask) {
            const assignmentPromises = newTask.assignees.map(async (assignee) => {
                try {
                    await this.taskAssignmentService.create({
                        taskId: newTask.id,
                        userId: assignee,
                        assignedById: newTask.createdById,
                        isActive: true,
                        assignedAt: newTask.createdAt
                    })
                } catch(error) {
                    Logger.error(`Failed to assign ${assignee}:`, error);
                }
            });

            const historyPromise = this.taskHistoryService.create({
                taskId: newTask.id,
                userId: newTask.createdById,
                action: TaskHistoryAction.CREATED,
                oldValue: null,
                newValue: {
                    title: newTask.title,
                    description: newTask.description,
                    status: newTask.status,
                    priority: newTask.priority,
                    dueDate: newTask.dueDate,
                    assignees: newTask.assignees,
                    createdById: newTask.createdById
                }
            });

            await Promise.all([...assignmentPromises, historyPromise]);

            try {
                await this.rabbitMQService.publishTaskCreated(newTask);
                Logger.log(`Published task.created event for task ${newTask.id}`);
            } catch (error) {
                Logger.error(`Failed to publish task.created event for task ${newTask.id}:`, error);
            }
        }

        return newTask;
    }

    async update(id: string | undefined, updateTask: UpdateTaskDto) {
        if(!id) {
            throw new Error("Task ID is required.");
        }
        const task = await this.findOne(id)
        if(!task) {
            throw new Error("Task not found.");
        }

        const changes: Record<string, unknown> = {};
        const oldValues: Record<string, unknown> = {};

        if (updateTask.title !== undefined && updateTask.title !== task.title) {
            changes.title = updateTask.title;
            oldValues.title = task.title;
        }
        if (updateTask.description !== undefined && updateTask.description !== task.description) {
            changes.description = updateTask.description;
            oldValues.description = task.description;
        }
        if (updateTask.status !== undefined && updateTask.status !== task.status) {
            changes.status = updateTask.status;
            oldValues.status = task.status;
        }
        if (updateTask.priority !== undefined && updateTask.priority !== task.priority) {
            changes.priority = updateTask.priority;
            oldValues.priority = task.priority;
        }
        if (updateTask.dueDate !== undefined && updateTask.dueDate !== task.dueDate) {
            changes.dueDate = updateTask.dueDate;
            oldValues.dueDate = task.dueDate;
        }

        if (updateTask.assignees && JSON.stringify(updateTask.assignees) !== JSON.stringify(task.assignees)) {
            const oldAssignees = task.assignees || [];
            const newAssignees = updateTask.assignees || [];

            const addedAssignees = newAssignees.filter(a => !oldAssignees.includes(a));
            const removedAssignees = oldAssignees.filter(a => !newAssignees.includes(a));
            for (const assignee of addedAssignees) {
                try {
                    await this.taskAssignmentService.create({
                        taskId: task.id,
                        userId: assignee,
                        assignedById: updateTask.createdById,
                        isActive: true,
                        assignedAt: new Date()
                    });

                    await this.taskHistoryService.create({
                        taskId: task.id,
                        userId: updateTask.createdById,
                        action: TaskHistoryAction.ASSIGNEE_ADDED,
                        oldValue: null,
                        newValue: { assignee }
                    });
                } catch (error) {
                    Logger.error(`Failed to add assignee ${assignee}:`, error);
                }
            }
            for (const assignee of removedAssignees) {
                try {
                    const assignments = await this.taskAssignmentService.findByTask(task.id);
                    const assignment = assignments.find(a => a.userId === assignee && a.isActive);

                    if (assignment) {
                        await this.taskAssignmentService.update({
                            id: assignment.id,
                            taskId: task.id,
                            userId: assignee,
                            assignedById: assignment.assignedById,
                            isActive: false,
                            unassignedAt: new Date()
                        });

                        await this.taskHistoryService.create({
                            taskId: task.id,
                            userId: updateTask.createdById,
                            action: TaskHistoryAction.ASSIGNEE_REMOVED,
                            oldValue: { assignee },
                            newValue: null
                        });
                    }
                } catch (error) {
                    Logger.error(`Failed to remove assignee ${assignee}:`, error);
                }
            }

            changes.assignees = newAssignees;
            oldValues.assignees = oldAssignees;
        }

        const updatedTask = await this.taskRepository.save({ ...task, ...updateTask });

        if (Object.keys(changes).length > 0) {
            await this.taskHistoryService.create({
                taskId: task.id,
                userId: updateTask.createdById,
                action: TaskHistoryAction.UPDATED,
                oldValue: oldValues,
                newValue: changes
            });
            try {
                await this.rabbitMQService.publishTaskUpdated(updatedTask);
                Logger.log(`Published task.updated event for task ${updatedTask.id}`);
            } catch (error) {
                Logger.error(`Failed to publish task.updated event for task ${updatedTask.id}:`, error);
            }
        }

        return updatedTask;
    }

    async delete(id: string) {
        const task = await this.findOne(id);
        if (!task) {
            throw new Error("Task not found.");
        }
        await this.taskHistoryService.create({
            taskId: task.id,
            userId: task.createdById,
            action: TaskHistoryAction.DELETED,
            oldValue: {
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                assignees: task.assignees,
                createdById: task.createdById
            },
            newValue: null
        });

        return await this.taskRepository.delete(id);
    }

}
