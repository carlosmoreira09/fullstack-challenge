import {
    Body,
    Controller,
    Delete,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put, Req,
    Request,
    UseGuards,
} from '@nestjs/common';
import { CreateCommentDto } from '@taskmanagerjungle/types';
import {AuthGuard} from "../../guards/auth/auth.guard";
import {NotificationsService} from "./notifications.service";

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  async createNotifications(@Body() createCommentDto: CreateCommentDto, @Request() req: any) {
      const userId = req.user?.userId;

      return await this.notificationsService.createNotifications(createCommentDto, userId)
  }

  @Put(':id')
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
              'Failed to delete comment',
              HttpStatus.INTERNAL_SERVER_ERROR
          );
      }
  }

  @Put('all')
  async markAllAsRead(@Req() req: any) {
    try {
        const userId = req.user?.userId;
        return this.notificationsService.markAllAsRead(userId)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete comment',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
