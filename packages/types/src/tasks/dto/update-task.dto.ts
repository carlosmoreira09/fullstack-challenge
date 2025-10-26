import {IsOptional, IsUUID} from 'class-validator';
import { CreateTaskDto } from './create-task.dto.js';

export class UpdateTaskDto extends CreateTaskDto {
  @IsUUID()
  @IsOptional()
  id?: string;
}
