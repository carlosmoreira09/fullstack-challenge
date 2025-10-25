import {IsDate, IsOptional, IsString, IsUUID} from "class-validator";
import {NotificationStatus, NotificationType} from "../notifications.enums";

export class CreateNotificationsDto {
    @IsUUID()
    userId!: string;
    @IsString()
    type!: NotificationType;
    @IsString()
    payload?: string | null;
    @IsString()
    status!: NotificationStatus
    @IsString()
    title!: string;
    @IsDate()
    @IsOptional()
    readAt?: Date | null;
}