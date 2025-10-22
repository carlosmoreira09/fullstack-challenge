import { IsArray, IsOptional, IsString } from 'class-validator';
import { TaskPriority, TaskStatus } from '../task.enums.js';

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  priority!: TaskPriority;

  @IsString()
  status!: TaskStatus;

  @IsOptional()
  @IsString()
  dueDate?: string | null;

  @IsArray()
  @IsString({ each: true })
  assignees!: string[];

  @IsString()
  createdById!: string;
}
