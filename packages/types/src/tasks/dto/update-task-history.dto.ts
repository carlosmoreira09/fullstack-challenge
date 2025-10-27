import { IsUUID } from "class-validator";
import { CreateTaskHistoryDto } from "./create-task-history.dto.js";

export class UpdateTaskHistoryDto extends CreateTaskHistoryDto {
  @IsUUID()
  id!: string;
}
