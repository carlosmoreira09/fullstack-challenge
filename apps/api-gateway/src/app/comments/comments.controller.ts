import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateCommentDto, UpdateCommentDto, UserDto } from '@taskmanagerjungle/types';
import {AuthGuard} from "../../guards/auth/auth.guard";
import {CommentService} from "tasks-service/dist/src/app/comment/comment.service";
import {CommentsService} from "./comments.service";

@Controller('comments')
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(
    private readonly commentService: CommentsService,
  ) {}

  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto, @Request() req: any) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        return await this.commentService.create(createCommentDto, userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create comment',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: any
  ) {
    try {
        return await this.commentService.update(id, updateCommentDto);

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update comment',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string, @Request() req: any) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      await this.commentService.delete(id,userId, userRole)

      return { message: 'Comment deleted successfully' };
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
