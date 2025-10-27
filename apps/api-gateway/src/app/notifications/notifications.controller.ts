import {
    Controller, Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import {JwtAuthGuard} from "../../guards/jwt-auth/jwt-auth.guard";
import {NotificationsService} from "./notifications.service";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from '../../decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}
    @Get()
    @ApiOperation({ summary: 'Get all notifications', description: 'Retrieve all notifications for the authenticated user' })
    @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll(@CurrentUser('userId') userId: string) {
        return await this.notificationsService.findAll(userId)
    }

    @Get('unread/count')
    @ApiOperation({ summary: 'Count unread notifications', description: 'Get count of unread notifications for the authenticated user' })
    @ApiResponse({ status: 200, description: 'Unread count retrieved', schema: { example: { count: 5 } } })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async countUnread(@CurrentUser('userId') userId: string) {
        const count = await this.notificationsService.countUnread(userId);
        return { count };
    }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all as read', description: 'Mark all notifications as read for the authenticated user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(@CurrentUser('userId') userId: string) {
    try {
        return this.notificationsService.markAllAsRead(userId)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to mark all notifications as read',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read', description: 'Mark a specific notification as read' })
  @ApiParam({ name: 'id', description: 'Notification UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string
  ) {
      try {
          return await this.notificationsService.markAsRead(id, userId)
      } catch (error) {
          if (error instanceof HttpException) {
              throw error;
          }
          throw new HttpException(
              'Failed to mark notification as read',
              HttpStatus.INTERNAL_SERVER_ERROR
          );
      }
  }
}
