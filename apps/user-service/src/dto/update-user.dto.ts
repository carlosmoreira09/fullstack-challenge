import {CreateUserDto} from "./create-user.dto";
import { IsString} from "class-validator";

export class UpdateUserDto extends CreateUserDto {
    @IsString()
    id: string;

}