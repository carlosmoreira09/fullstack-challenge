import { TaskPriority, TaskStatus } from '../task.enums';
import {IsArray, IsDate, IsString} from "class-validator";

export class TaskDto {
    @IsString()
    id!: string;
    @IsString()
    title!: string;
    @IsString()
    description?: string | null;
    @IsString()
    priority!: TaskPriority;
    @IsString()
    status!: TaskStatus;
    @IsDate()
    dueDate?: Date | null;
    @IsString()
    createdById!: string;
    @IsArray()
    assignees!: string[];
    @IsDate()
    createdAt!: Date;
    @IsDate()
    updatedAt!: Date;
}
