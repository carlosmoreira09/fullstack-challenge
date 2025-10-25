import {IsString, IsUUID} from 'class-validator';
import { CreateTaskDto } from './create-task.dto.js';

export class UpdateTaskDto extends CreateTaskDto {
  @IsUUID()
  id!: string;
}
