import { IsUUID } from "class-validator";
import { CreateNotificationsDto } from "./create-notifications.dto.js";

export class UpdateNotificationsDto extends CreateNotificationsDto {
  @IsUUID()
  id!: string;
}
