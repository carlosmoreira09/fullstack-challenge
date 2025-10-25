import {IsUUID} from "class-validator";
import {CreateNotificationsDto} from "./create-notifications.dto";

export class UpdateNotificationsDto extends CreateNotificationsDto {
    @IsUUID()
    id: number
}