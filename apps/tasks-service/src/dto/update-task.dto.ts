import {CreateTaskDto} from "./create-task.dto";
import {IsNumber} from "class-validator";

export class UpdateTaskDto extends CreateTaskDto {
    @IsNumber()
    id: number
}