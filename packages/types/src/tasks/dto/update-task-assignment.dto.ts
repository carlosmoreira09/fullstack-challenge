import {IsBoolean, IsDate, IsString} from "class-validator";
import {CreateTaskAssignmentDto} from "./create-task-assignment.dto";

export class UpdateTaskAssignmentDto extends CreateTaskAssignmentDto{
    @IsString()
    id!: string;
}