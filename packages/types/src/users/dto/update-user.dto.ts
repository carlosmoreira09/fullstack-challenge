import { IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserDto extends CreateUserDto {
  @IsString()
  id!: string;
}
