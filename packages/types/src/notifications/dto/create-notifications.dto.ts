import { IsDate, IsOptional, IsString, IsUUID } from "class-validator";
import {
  NotificationStatus,
  NotificationType,
} from "../notifications.enums.js";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateNotificationsDto {
  @ApiProperty({
    description: "UUID of the user who will receive the notification",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  userId!: string;

  @ApiProperty({
    description: "Type of notification",
    enum: NotificationType,
    example: NotificationType.TASK_ASSIGNED,
  })
  @IsString()
  type!: NotificationType;

  @ApiProperty({
    description: "Notification status",
    enum: NotificationStatus,
    example: NotificationStatus.UNREAD,
  })
  @IsString()
  status!: NotificationStatus;

  @ApiProperty({
    description: "Notification title",
    example: "New task assigned to you",
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    description: "Notification payload (JSON string)",
    example:
      '{"taskId": "123e4567-e89b-12d3-a456-426614174000", "taskTitle": "Implement feature X"}',
  })
  @IsString()
  @IsOptional()
  payload?: string;

  @ApiPropertyOptional({
    description: "Additional metadata",
    example: {},
  })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({
    description: "Timestamp when notification was read",
    example: "2024-01-15T10:30:00.000Z",
    type: Date,
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  read_at?: Date | null;
}
