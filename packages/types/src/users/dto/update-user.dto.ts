import { IsUUID} from 'class-validator';
import { CreateUserDto } from './create-user.dto.js';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends CreateUserDto {
  @ApiProperty({
    description: 'UUID of the user to update',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  id!: string;
}
