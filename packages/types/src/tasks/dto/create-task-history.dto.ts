import { IsDate, IsObject, IsOptional, IsString} from "class-validator";
import {TaskHistoryAction} from "../task.enums.js";

export class CreateTaskHistoryDto {
    @IsString()
    taskId!: string;

    @IsString()
    userId!: string;

    @IsString()
    action!: TaskHistoryAction;

    @IsOptional()
    @IsObject()
    oldValue?: Record<string, unknown> | null;

    @IsOptional()
    @IsObject()
    newValue?: Record<string, unknown> | null;

    @IsOptional()
    @IsDate()
    createdAt?: Date
}