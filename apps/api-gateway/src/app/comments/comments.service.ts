import {HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, catchError, firstValueFrom } from 'rxjs';
import * as amqp from 'amqplib';
import {CreateCommentDto, UpdateCommentDto} from "@taskmanagerjungle/types";

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @Inject('TASKS_SERVICE') private readonly taskClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly userClient: ClientProxy,
  ) {}
    async create(createCommentDTO: CreateCommentDto, userId: string){
        const commentData = {
            ...createCommentDTO,
            authorId: userId,
        };
      const comment = await firstValueFrom(
            this.taskClient.send('create-comment', commentData)
        );
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
    }
    async update(userId: string, updateCommentDto: UpdateCommentDto) {
        const comment = await firstValueFrom(
            this.taskClient.send('get-comment', updateCommentDto.id)
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
            this.taskClient.send('update-comment', {...updateCommentDto, id: updateCommentDto.id})
        );

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
    }

    async delete(commentId: string, userId: string, userRole: string) {

        const comment = await firstValueFrom(
            this.taskClient.send('get-comment', commentId)
        );

        if (!comment) {
            throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
        }

        if (userRole !== 'ADMIN' && comment.authorId !== userId) {
            throw new HttpException(
                'Only admins can delete other users comments',
                HttpStatus.FORBIDDEN
            );
        }
        await firstValueFrom(this.taskClient.send('delete-comment', commentId));
        return { message: 'Comment deleted successfully' };
    }

}
