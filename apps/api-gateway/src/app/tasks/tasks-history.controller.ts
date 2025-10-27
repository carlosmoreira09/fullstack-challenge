import {
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { TaskHistoryDto, UserDto } from '@taskmanagerjungle/types';
import { JwtAuthGuard } from '../../guards/jwt-auth/jwt-auth.guard';

@Controller('tasks-history')
@UseGuards(JwtAuthGuard)
export class TasksHistoryController {
  constructor(
    @Inject('TASKS_SERVICE')
    private readonly taskClient: ClientProxy,
    @Inject('USERS_SERVICE')
    private readonly userClient: ClientProxy,
  ) {}

  @Get('task/:taskId')
  async findByTask(@Param('taskId') taskId: string) {
    try {
      const history: TaskHistoryDto[] = await firstValueFrom(
        this.taskClient.send('list-history-by-task', taskId),
      );

      if (!history || history.length === 0) {
        return [];
      }

      const uniqueUserIds: string[] = [
        ...new Set(history.map((h: any) => h.userId)),
      ] as string[];
      const usersMap = new Map<string, UserDto>();

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const user: UserDto = await firstValueFrom(
              this.userClient.send('user-profile', userId),
            );
            usersMap.set(userId, user);
          } catch (error) {
            Logger.error(`Failed to fetch user ${userId}:`, error);
          }
        }),
      );

      return history.map((entry: any) => ({
        ...entry,
        userName: usersMap.get(entry.userId)?.name || 'Unknown',
        userEmail: usersMap.get(entry.userId)?.email || '',
      }));
    } catch (error) {
      Logger.error('Error fetching task history:', error);
      return [];
    }
  }
}
