import {IsOptional, IsString} from "class-validator";

export class LoginDTO  {
    @IsString()
    username!: string;

    @IsString()
    password!: string;

    @IsOptional()
    @IsString()
    ip?: string;
}