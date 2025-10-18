import {IsDate, IsNumber, IsString} from "class-validator";

export class CreateNotificationsDto {
    @IsNumber()
    userId: number;
    @IsString()
    type: string;
    @IsString()
    payload: string;
    @IsDate()
    readAt: Date;
}