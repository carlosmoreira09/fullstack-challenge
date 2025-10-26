import {
    Controller, Get,
    HttpException,
    HttpStatus,
    Param,
    Patch, Req,
    UseGuards,
} from '@nestjs/common';
import {AuthGuard} from "../../guards/auth/auth.guard";
import {NotificationsService} from "./notifications.service";

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}
    @Get()
    async findAll(@Req() req: any) {
        const userId = req.user?.userId;
        return await this.notificationsService.findAll(userId)
    }

    @Get('unread/count')
    async countUnread(@Req() req: any) {
        const userId = req.user?.userId;
        const count = await this.notificationsService.countUnread(userId);
        return { count };
    }

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    try {
        const userId = req.user?.userId;
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
  async markAsRead(
    @Param('id') id: string,
    @Req() req: any
  ) {
      try {
          const userId = req.user?.userId;
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
