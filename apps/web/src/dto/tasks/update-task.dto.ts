import type { CreateTaskDto } from "@/dto/tasks/create-task.dto.ts";

export interface UpdateTaskDto extends CreateTaskDto {
    id: string;
}
