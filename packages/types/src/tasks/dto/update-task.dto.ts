import { IsOptional, IsUUID } from "class-validator";
import { CreateTaskDto } from "./create-task.dto.js";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateTaskDto extends CreateTaskDto {
  @ApiPropertyOptional({
    description: "UUID of the task to update",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsOptional()
  id?: string;
}
