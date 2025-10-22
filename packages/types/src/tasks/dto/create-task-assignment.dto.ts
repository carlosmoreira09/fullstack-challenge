import {IsBoolean, IsDate, IsString} from "class-validator";

export class CreateTaskAssignmentDto {
    @IsString()
    taskId!: string;

    @IsString()
    userId!: string;

    @IsString()
    assignedById!: string;

    @IsBoolean()
    isActive?: boolean;

    @IsDate()
    assignedAt?: Date;

    @IsDate()
    unassignedAt?: Date
}