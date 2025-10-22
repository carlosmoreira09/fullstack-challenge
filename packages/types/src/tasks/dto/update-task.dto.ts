import { IsString } from 'class-validator';
import { CreateTaskDto } from './create-task.dto.js';

export class UpdateTaskDto extends CreateTaskDto {
  @IsString()
  id!: string;
}
