import { IsDate, IsString, IsUUID} from "class-validator";

export class CreateNotificationsDto {
    @IsUUID()
    userId: number;
    @IsString()
    type: string;
    @IsString()
    payload: string;
    @IsDate()
    readAt: Date;
}