import {IsDate, IsString} from "class-validator";

export class UserDto {
    @IsString()
    id!: string;
    @IsString()
    name!: string;
    @IsDate()
    birthday!: Date;
    @IsString()
    document!: string;
    @IsString()
    email!: string;
    @IsString()
    role!: string;
    @IsString()
    createdById!: string;
    @IsDate()
    created_at!: Date;
    @IsDate()
    updated_at!: Date;
}

export interface User {
    id?: string;
    name: string;
    email: string;
    document?: string;
    role?: string;
    birthday?: string;
    createdById?: number
}
