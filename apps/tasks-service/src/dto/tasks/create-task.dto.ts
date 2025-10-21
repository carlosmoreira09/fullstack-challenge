import {IsArray, IsNumber, IsString} from "class-validator";
import {TaskPriority, TaskStatus} from "../../enum/tasks.enum";

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsString()
    description?: string;

    @IsString()
    priority: TaskPriority;

    @IsString()
    status: TaskStatus;

    @IsString()
    dueDate?: string;

    @IsArray()
    assignees: number[];

    @IsNumber()
    createdById: number;
}