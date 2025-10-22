import { IsDate, IsObject, IsString} from "class-validator";
import {TaskHistoryAction} from "../task.enums";

export class CreateTaskHistoryDto {
    @IsString()
    taskId!: string;

    @IsString()
    userId!: string;

    @IsObject()
    action!: TaskHistoryAction;

    @IsObject()
    oldValue?: Record<string, unknown> | null;

    @IsDate()
    newValue?: Record<string, unknown> | null;

    @IsDate()
    createdAt?: Date
}