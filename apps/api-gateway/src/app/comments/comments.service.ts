import {HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {CreateCommentDto, NotificationStatus, NotificationType, UpdateCommentDto} from "@taskmanagerjungle/types";
import {NotificationsService} from "../notifications/notifications.service";

@Injectable()
export class CommentsService {

  constructor(
    @Inject('TASKS_SERVICE') private readonly taskClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly userClient: ClientProxy,
    private readonly notificationsService: NotificationsService
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
        const task = await firstValueFrom(
          this.taskClient.send('get-task', createCommentDTO.taskId)
        );
        
        if (task) {
          let authorName = 'Someone';
          try {
            const author = await firstValueFrom(
              this.userClient.send('user-profile', userId)
            );
            authorName = author?.name || 'Someone';
          } catch (error) {
            Logger.error(`Failed to fetch comment author ${userId}:`, error);
          }
          
          const notificationRecipients = [task.createdById, ...task.assignees]
            .filter((recipientId, index, self) => self.indexOf(recipientId) === index)
            .filter(recipientId => recipientId !== userId);
          
          const notificationPromises = notificationRecipients.map(async (recipientId) => {
            try {
              let recipientName = 'you';
              try {
                const recipient = await firstValueFrom(
                  this.userClient.send('user-profile', recipientId)
                );
                recipientName = recipient?.name || 'you';
              } catch (error) {
                Logger.error(`Failed to fetch recipient ${recipientId}:`, error);
              }
              
              await this.notificationsService.createNotifications({
                userId: recipientId,
                payload: comment.content,
                status: NotificationStatus.UNREAD,
                title: `${authorName} commented on: ${task.title}`,
                read_at: null,
                type: NotificationType.COMMENT_CREATED,
                metadata: {
                  authorId: userId,
                  authorName: authorName,
                  recipientId: recipientId,
                  recipientName: recipientName,
                  taskId: task.id,
                  taskTitle: task.title,
                  commentId: comment.id
                }
              });
              
              Logger.log(`Comment notification created for user ${recipientId} (${recipientName})`);
            } catch (error) {
              Logger.error(`Failed to create comment notification for ${recipientId}:`, error);
            }
          });
          
          await Promise.all(notificationPromises);
        }
      } catch (error) {
        Logger.error('Failed to create comment notifications:', error);
      }
      
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
