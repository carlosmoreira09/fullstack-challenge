import {TaskHistoryAction} from '../task.enums.js';
import {IsDate, IsObject, IsString} from "class-validator";
import {TaskDto} from "./task.dto.js";

export class TaskHistoryDto {
    @IsString()
    id!: string;
    @IsString()
    taskId!: string;
    @IsString()
    userId?: string;
    @IsString()
    action!: TaskHistoryAction;
    @IsObject()
    oldValue?: Record<string, unknown> | null;
    @IsObject()
    newValue?: Record<string, unknown> | null;
    @IsObject()
    task!: TaskDto;
    @IsDate()
    createdAt!: Date;
    @IsDate()
    updatedAt!: Date;
}
export interface TaskHistoryEntry {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    action: string;
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    createdAt: string;
    userData?: {
        id: string;
        name: string;
        email: string;
        role?: string;
    } | null;
}