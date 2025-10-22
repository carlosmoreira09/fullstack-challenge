import {IsBoolean, IsDate, IsObject, IsString} from "class-validator";
import {TaskDto} from "./task.dto.js";

export class TaskAssignmentDto {
    @IsString()
    id!: string;
    @IsString()
    taskId!: string;
    @IsString()
    userId?: string;
    @IsObject()
    task!: TaskDto;
    @IsString()
    assignedById!: string;
    @IsBoolean()
    isActive!: boolean;
    @IsDate()
    assignedAt!: Date;
    @IsDate()
    unassignedAt?: Date;

}
