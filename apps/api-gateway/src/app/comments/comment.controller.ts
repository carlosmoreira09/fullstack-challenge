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
  Request,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateCommentDto, UpdateCommentDto, UserDto } from '@taskmanagerjungle/types';
import {AuthGuard} from "../../guards/auth/auth.guard";

@Controller('comments')
@UseGuards(AuthGuard)
export class CommentController {
  constructor(
    @Inject('TASKS_SERVICE')
    private readonly taskClient: ClientProxy,
    @Inject('USERS_SERVICE')
    private readonly userClient: ClientProxy,
  ) {}

  @Get('task/:taskId')
  async findByTask(@Param('taskId') taskId: string) {
    try {
      const comments = await firstValueFrom(
        this.taskClient.send('list-comments-by-task', taskId)
      );

      if (!comments || comments.length === 0) {
        return [];
      }

      // Fetch author data for all comments
      const uniqueAuthorIds: string[] = [...new Set(comments.map((c: any) => c.authorId))] as string[];
      const usersMap = new Map<string, UserDto>();

      await Promise.all(
        uniqueAuthorIds.map(async (authorId) => {
          try {
            const user: UserDto = await firstValueFrom(
              this.userClient.send('user-profile', authorId)
            );
            usersMap.set(authorId, user);
          } catch (error) {
            console.error(`Failed to fetch user ${authorId}:`, error);
          }
        })
      );

      return comments.map((comment: any) => ({
        ...comment,
        authorName: usersMap.get(comment.authorId)?.name || 'Unknown',
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto, @Request() req: any) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const commentData = {
        ...createCommentDto,
        authorId: userId,
      };

      const comment = await firstValueFrom(
        this.taskClient.send('create-comment', commentData)
      );

      // Fetch author data
      try {
        const user = await firstValueFrom(
          this.userClient.send('user-profile', userId)
        );
        return {
          ...comment,
          authorName: user.name,
        };
      } catch (error) {
        return {
          ...comment,
          authorName: 'Unknown',
        };
      }
    } catch (error) {
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
      const userId = req.user?.userId;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      // Fetch the comment to check ownership
      const comment = await firstValueFrom(
        this.taskClient.send('get-comment', id)
      );

      if (!comment) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }

      if (comment.authorId !== userId) {
        throw new HttpException(
          'You can only edit your own comments',
          HttpStatus.FORBIDDEN
        );
      }

      const updatedComment = await firstValueFrom(
        this.taskClient.send('update-comment', { ...updateCommentDto, id })
      );

      // Fetch author data
      try {
        const user = await firstValueFrom(
          this.userClient.send('user-profile', comment.authorId)
        );
        return {
          ...updatedComment,
          authorName: user.name,
        };
      } catch (error) {
        return {
          ...updatedComment,
          authorName: 'Unknown',
        };
      }
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

      // Fetch the comment to check ownership
      const comment = await firstValueFrom(
        this.taskClient.send('get-comment', id)
      );

      if (!comment) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }

      // Only admin can delete any comment, others can only delete their own
      if (userRole !== 'ADMIN' && comment.authorId !== userId) {
        throw new HttpException(
          'Only admins can delete other users comments',
          HttpStatus.FORBIDDEN
        );
      }

      await firstValueFrom(this.taskClient.send('delete-comment', id));

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
