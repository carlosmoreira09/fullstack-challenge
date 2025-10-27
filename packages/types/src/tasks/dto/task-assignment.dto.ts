import { IsBoolean, IsDate, IsObject, IsUUID } from "class-validator";
import { TaskDto } from "./task.dto.js";

export class TaskAssignmentDto {
  @IsUUID()
  id!: string;
  @IsUUID()
  taskId!: string;
  @IsUUID()
  userId?: string;
  @IsObject()
  task!: TaskDto;
  @IsUUID()
  assignedById!: string;
  @IsBoolean()
  isActive!: boolean;
  @IsDate()
  assignedAt!: Date;
  @IsDate()
  unassignedAt?: Date;
}
