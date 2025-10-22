import {IsBoolean, IsDate, IsString} from "class-validator";
import {CreateTaskAssignmentDto} from "./create-task-assignment.dto.js";
import {CreateTaskHistoryDto} from "./create-task-history.dto.js";

export class UpdateTaskHistoryDto extends CreateTaskHistoryDto{
    @IsString()
    id!: string;
}