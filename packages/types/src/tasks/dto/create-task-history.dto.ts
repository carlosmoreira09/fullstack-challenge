import {IsDate, IsObject, IsOptional, IsString, IsUUID} from "class-validator";
import {TaskHistoryAction} from "../task.enums.js";

export class CreateTaskHistoryDto {
    @IsUUID()
    taskId!: string;

    @IsUUID()
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