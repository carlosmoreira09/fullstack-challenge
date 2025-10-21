import {CreateTaskDto} from "./create-task.dto";
import {IsString} from "class-validator";

export class UpdateTaskDto extends CreateTaskDto {
    @IsString()
    id: string
}