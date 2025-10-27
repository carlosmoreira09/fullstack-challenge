import { IsUUID } from "class-validator";
import { CreateTaskAssignmentDto } from "./create-task-assignment.dto.js";

export class UpdateTaskAssignmentDto extends CreateTaskAssignmentDto {
  @IsUUID()
  id!: string;
}
