import {IsDate, IsOptional, IsString, IsUUID} from "class-validator";
import {NotificationStatus, NotificationType} from "../notifications.enums.js";

export class CreateNotificationsDto {
    @IsUUID()
    userId!: string;
    @IsString()
    type!: NotificationType;
    @IsString()
    status!: NotificationStatus
    @IsString()
    title!: string;
    @IsString()
    @IsOptional()
    payload?: string;
    @IsOptional()
    metadata?: any;
    @IsDate()
    @IsOptional()
    read_at?: Date | null;
}