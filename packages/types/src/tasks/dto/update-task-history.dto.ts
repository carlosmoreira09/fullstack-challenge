import {IsBoolean, IsDate, IsString} from "class-validator";
import {CreateTaskAssignmentDto} from "./create-task-assignment.dto";
import {CreateTaskHistoryDto} from "./create-task-history.dto";

export class UpdateTaskHistoryDto extends CreateTaskHistoryDto{
    @IsString()
    id!: string;
}