import {IsString, IsUUID} from 'class-validator';
import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserDto extends CreateUserDto {
  @IsUUID()
  id!: string;
}
