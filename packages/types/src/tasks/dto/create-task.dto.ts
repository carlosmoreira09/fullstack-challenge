import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";
import { TaskPriority, TaskStatus } from "../task.enums.js";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty({
    description: "Task title",
    example: "Implement user authentication",
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    description: "Detailed task description",
    example: "Implement JWT-based authentication with refresh tokens",
  })
  @IsOptional()
  @IsString()
  description!: string;

  @ApiProperty({
    description: "Task priority level",
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsString()
  priority!: TaskPriority;

  @ApiProperty({
    description: "Current task status",
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsString()
  status!: TaskStatus;

  @ApiPropertyOptional({
    description: "Task due date (ISO 8601 format)",
    example: "2024-12-31T23:59:59.000Z",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  dueDate?: string | null;

  @ApiProperty({
    description: "Array of user IDs assigned to this task",
    type: [String],
    example: [
      "123e4567-e89b-12d3-a456-426614174000",
      "987fcdeb-51a2-43d7-b789-123456789abc",
    ],
  })
  @IsArray()
  @IsString({ each: true })
  assignees!: string[];

  @ApiProperty({
    description: "UUID of the user who created this task",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  createdById!: string;
}
