import {
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateTaskDto,
  NotificationStatus,
  NotificationType,
  Task,
  TaskDto,
  UpdateTaskDto,
  UserDto,
} from '@taskmanagerjungle/types';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject('TASKS_SERVICE')
    private readonly taskClient: ClientProxy,
    @Inject('USERS_SERVICE')
    private readonly userClient: ClientProxy,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll() {
    const tasks: TaskDto[] = await firstValueFrom(
      this.taskClient.send('list-tasks', {}),
    );

    if (tasks.length === 0) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const uniqueAssigneeIds = [
      ...new Set(tasks.flatMap((task) => task.assignees)),
    ];
    const uniqueCreatorIds = [
      ...new Set(tasks.map((task) => task.createdById)),
    ];
    const allUserIds = [
      ...new Set([...uniqueAssigneeIds, ...uniqueCreatorIds]),
    ];

    const usersMap = new Map<string, UserDto>();
    await Promise.all(
      allUserIds.map(async (userId) => {
        try {
          const user = await firstValueFrom(
            this.userClient.send('user-profile', userId),
          );
          usersMap.set(userId, user);
        } catch (error) {
          Logger.error(`Failed to fetch user ${userId}:`, error);
        }
      }),
    );

    return tasks.map((task) => ({
      ...task,
      createdByData: usersMap.get(task.createdById),
      assigneesData: task.assignees
        .map((assigneeId) => usersMap.get(assigneeId))
        .filter((user) => user !== undefined),
    }));
  }

  async findByUserId(userId: string, includeAssigned?: string) {
    let messagePattern = 'list-tasks-created-by-user';

    if (includeAssigned === 'true') {
      messagePattern = 'list-tasks-created-and-assigned';
    }

    const tasks: TaskDto[] = await firstValueFrom(
      this.taskClient.send(messagePattern, userId),
    );

    if (!tasks || tasks.length === 0) {
      return [];
    }
    const uniqueAssigneeIds = [
      ...new Set(tasks.flatMap((task) => task.assignees)),
    ];
    const uniqueCreatorIds = [
      ...new Set(tasks.map((task) => task.createdById)),
    ];
    const allUserIds = [
      ...new Set([...uniqueAssigneeIds, ...uniqueCreatorIds]),
    ];
    const usersMap = new Map<string, UserDto>();
    await Promise.all(
      allUserIds.map(async (userId) => {
        try {
          const user = await firstValueFrom(
            this.userClient.send('user-profile', userId),
          );
          usersMap.set(userId, user);
        } catch (error) {
          Logger.error(`Failed to fetch list tasks by user ${userId}:`, error);
        }
      }),
    );

    return tasks.map((task) => ({
      ...task,
      createdByData: usersMap.get(task.createdById),
      assigneesData: task.assignees
        .map((assigneeId) => usersMap.get(assigneeId))
        .filter((user) => user !== undefined),
    }));
  }

  async findOne(taskId: string) {
    const task: TaskDto = await firstValueFrom(
      this.taskClient.send('get-task', taskId),
    );

    if (!task) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const uniqueAssigneeIds = [...new Set(task.assignees)];
    const allUserIds = [...new Set([...uniqueAssigneeIds, task.createdById])];
    const usersMap = new Map<string, UserDto>();

    await Promise.all(
      allUserIds.map(async (userId) => {
        try {
          const user = await firstValueFrom(
            this.userClient.send('user-profile', userId),
          );
          usersMap.set(userId, user);
        } catch (error) {
          Logger.error(`Failed to fetch user ${userId}:`, error);
        }
      }),
    );

    return {
      ...task,
      createdByData: usersMap.get(task.createdById),
      assigneesData: task.assignees
        .map((assigneeId) => usersMap.get(assigneeId))
        .filter((user) => user !== undefined),
    };
  }

  async createTask(@Body() task: CreateTaskDto) {
    const createdTask: Task = await firstValueFrom(
      this.taskClient.send('create-task', task),
    );

    if (
      createdTask &&
      createdTask.assignees &&
      createdTask.assignees.length > 0
    ) {
      let creatorName = 'Someone';
      try {
        const creator = await firstValueFrom(
          this.userClient.send('user-profile', task.createdById),
        );
        creatorName = creator?.name || 'Someone';
      } catch (error) {
        Logger.error(`Failed to fetch creator ${task.createdById}:`, error);
      }
      const notificationPromises = createdTask.assignees.map(
        async (assigneeId) => {
          try {
            let assigneeName = 'you';
            try {
              const assignee = await firstValueFrom(
                this.userClient.send('user-profile', assigneeId),
              );
              assigneeName = assignee?.name || 'you';
            } catch (error) {
              Logger.error(`Failed to fetch assignee ${assigneeId}:`, error);
            }
            await this.notificationsService.createNotifications({
              userId: assigneeId,
              payload:
                task.description ||
                `You have been assigned to task: ${task.title}`,
              status: NotificationStatus.UNREAD,
              title: `${creatorName} assigned you to: ${task.title}`,
              read_at: null,
              type: NotificationType.TASK_ASSIGNED,
              metadata: {
                creatorId: task.createdById,
                creatorName: creatorName,
                assigneeId: assigneeId,
                assigneeName: assigneeName,
                taskId: createdTask.id,
                taskTitle: task.title,
              },
            });

            Logger.log(
              `Notification created for assignee ${assigneeId} (${assigneeName})`,
            );
          } catch (error) {
            Logger.error(
              `Failed to create notification for assignee ${assigneeId}:`,
              error,
            );
          }
        },
      );

      await Promise.all(notificationPromises);
    }

    return createdTask;
  }

  async updateTask(task: UpdateTaskDto) {
    const oldTask: Task = await firstValueFrom(
      this.taskClient.send('get-task', task.id),
    );

    if (!oldTask) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    const updatedTask: Task = await firstValueFrom(
      this.taskClient.send('update-task', task),
    );

    let updaterName = 'Someone';
    try {
      const updater = await firstValueFrom(
        this.userClient.send('user-profile', task.createdById),
      );
      updaterName = updater?.name || 'Someone';
    } catch (error) {
      Logger.error(`Failed to fetch updater ${task.createdById}:`, error);
    }
    const notifiedUsers = new Set<string>();
    const oldAssignees = oldTask.assignees || [];
    const newAssignees = task.assignees || [];
    const assigneesChanged =
      JSON.stringify(newAssignees.sort()) !==
      JSON.stringify(oldAssignees.sort());

    let addedAssignees: string[] = [];
    let removedAssignees: string[] = [];

    if (assigneesChanged) {
      Logger.log(`Task ${task.id} assignees changed`);
      addedAssignees = newAssignees.filter((a) => !oldAssignees.includes(a));
      removedAssignees = oldAssignees.filter((a) => !newAssignees.includes(a));
      if (addedAssignees.length > 0) {
        const addedNotificationPromises = addedAssignees.map(
          async (assigneeId) => {
            try {
              let assigneeName = 'you';
              try {
                const assignee = await firstValueFrom(
                  this.userClient.send('user-profile', assigneeId),
                );
                assigneeName = assignee?.name || 'you';
              } catch (error) {
                Logger.error(`Failed to fetch assignee ${assigneeId}:`, error);
              }

              await this.notificationsService.createNotifications({
                userId: assigneeId,
                payload:
                  task.description ||
                  `You have been assigned to task: ${updatedTask.title}`,
                status: NotificationStatus.UNREAD,
                title: `${updaterName} assigned you to: ${updatedTask.title}`,
                read_at: null,
                type: NotificationType.TASK_ASSIGNED,
                metadata: {
                  updaterId: task.createdById,
                  updaterName: updaterName,
                  assigneeId: assigneeId,
                  assigneeName: assigneeName,
                  taskId: updatedTask.id,
                  taskTitle: updatedTask.title,
                },
              });

              notifiedUsers.add(assigneeId);
              Logger.log(
                `Assignment notification created for new assignee ${assigneeId} (${assigneeName})`,
              );
            } catch (error) {
              Logger.error(
                `Failed to create assignment notification for ${assigneeId}:`,
                error,
              );
            }
          },
        );

        await Promise.all(addedNotificationPromises);
      }
      if (removedAssignees.length > 0) {
        const removedNotificationPromises = removedAssignees.map(
          async (assigneeId) => {
            try {
              let assigneeName = 'you';
              try {
                const assignee = await firstValueFrom(
                  this.userClient.send('user-profile', assigneeId),
                );
                assigneeName = assignee?.name || 'you';
              } catch (error) {
                Logger.error(`Failed to fetch assignee ${assigneeId}:`, error);
              }

              await this.notificationsService.createNotifications({
                userId: assigneeId,
                payload: `You have been removed from task: ${updatedTask.title}`,
                status: NotificationStatus.UNREAD,
                title: `${updaterName} removed you from: ${updatedTask.title}`,
                read_at: null,
                type: NotificationType.TASK_UPDATED,
                metadata: {
                  updaterId: task.createdById,
                  updaterName: updaterName,
                  assigneeId: assigneeId,
                  assigneeName: assigneeName,
                  taskId: updatedTask.id,
                  taskTitle: updatedTask.title,
                  action: 'removed',
                },
              });

              notifiedUsers.add(assigneeId);
              Logger.log(
                `Removal notification created for removed assignee ${assigneeId} (${assigneeName})`,
              );
            } catch (error) {
              Logger.error(
                `Failed to create removal notification for ${assigneeId}:`,
                error,
              );
            }
          },
        );

        await Promise.all(removedNotificationPromises);
      }
    }
    const statusChanged = task.status && task.status !== oldTask.status;

    if (statusChanged) {
      Logger.log(
        `Task ${task.id} status changed from ${oldTask.status} to ${task.status}`,
      );
      if (updatedTask.assignees && updatedTask.assignees.length > 0) {
        const assigneesToNotify = updatedTask.assignees.filter(
          (assigneeId) => !notifiedUsers.has(assigneeId),
        );

        if (assigneesToNotify.length > 0) {
          const statusNotificationPromises = assigneesToNotify.map(
            async (assigneeId) => {
              try {
                let assigneeName = 'you';
                try {
                  const assignee = await firstValueFrom(
                    this.userClient.send('user-profile', assigneeId),
                  );
                  assigneeName = assignee?.name || 'you';
                } catch (error) {
                  Logger.error(
                    `Failed to fetch assignee ${assigneeId}:`,
                    error,
                  );
                }

                await this.notificationsService.createNotifications({
                  userId: assigneeId,
                  payload: `Status changed from ${oldTask.status} to ${task.status}`,
                  status: NotificationStatus.UNREAD,
                  title: `${updaterName} changed status of: ${updatedTask.title}`,
                  read_at: null,
                  type: NotificationType.TASK_UPDATED,
                  metadata: {
                    updaterId: task.createdById,
                    updaterName: updaterName,
                    assigneeId: assigneeId,
                    assigneeName: assigneeName,
                    taskId: updatedTask.id,
                    taskTitle: updatedTask.title,
                    oldStatus: oldTask.status,
                    newStatus: task.status,
                  },
                });

                Logger.log(
                  `Status change notification created for assignee ${assigneeId} (${assigneeName})`,
                );
              } catch (error) {
                Logger.error(
                  `Failed to create status notification for assignee ${assigneeId}:`,
                  error,
                );
              }
            },
          );

          await Promise.all(statusNotificationPromises);
        }
      }
    }

    return updatedTask;
  }

  async getTaskComments(taskId: string, page?: string, size?: string) {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = size ? parseInt(size, 10) : 10;

      const response = await firstValueFrom(
        this.taskClient.send('list-comments-by-task', {
          taskId,
          page: pageNum,
          limit: limitNum,
        }),
      );

      if (!response || !response.data || response.data.length === 0) {
        return {
          data: [],
          meta: {
            total: 0,
            page: pageNum,
            limit: limitNum,
            totalPages: 0,
          },
        };
      }

      const uniqueAuthorIds: string[] = [
        ...new Set(response.data.map((c: any) => c.authorId)),
      ] as string[];
      const usersMap = new Map<string, UserDto>();

      await Promise.all(
        uniqueAuthorIds.map(async (authorId) => {
          try {
            const user: UserDto = await firstValueFrom(
              this.userClient.send('user-profile', authorId),
            );
            usersMap.set(authorId, user);
          } catch (error) {
            Logger.error(`Failed to fetch user ${authorId}:`, error);
          }
        }),
      );

      return {
        data: response.data.map((comment: any) => ({
          ...comment,
          authorName: usersMap.get(comment.authorId)?.name || 'Unknown',
        })),
        meta: response.meta,
      };
    } catch (error) {
      Logger.error('Error fetching comments:', error);
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
    }
  }
}
