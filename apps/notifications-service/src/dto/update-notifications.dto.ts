import { IsNumber } from "class-validator";
import {CreateNotificationsDto} from "./create-notifications.dto";

export class UpdateNotificationsDto extends CreateNotificationsDto {
    @IsNumber()
    id: number
}