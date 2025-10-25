import {IsBoolean, IsDate, IsString, IsUUID} from "class-validator";

export class CreateTaskAssignmentDto {
    @IsUUID()
    taskId!: string;

    @IsUUID()
    userId!: string;

    @IsUUID()
    assignedById!: string;

    @IsBoolean()
    isActive?: boolean;

    @IsDate()
    assignedAt?: Date;

    @IsDate()
    unassignedAt?: Date
}