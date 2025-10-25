import { TaskPriority, TaskStatus } from '../task.enums.js';
import {IsArray, IsDate, IsString, IsUUID} from "class-validator";
import {User} from "../../users";

export class TaskDto {
    @IsUUID()
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
    @IsUUID()
    createdById!: string;
    @IsArray()
    assignees!: string[];
    @IsDate()
    createdAt!: Date;
    @IsDate()
    updatedAt!: Date;
}

export interface Task {
    id?: string;
    title: string;
    description?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
    assignees: string[];
    assigneesData?: User[];
    createdById?: string;
    createdByData?: User;
    createdAt?: string;
    updatedAt?: string;
}

export interface ListTasksParams {
    page?: number;
    size?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    createdById?: string;
}