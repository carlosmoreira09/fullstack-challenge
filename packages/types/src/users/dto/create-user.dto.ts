import {IsDate, IsEmail, IsString, IsUUID} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe'
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'User birthday',
    example: '1990-01-15T00:00:00.000Z',
    type: Date
  })
  @IsDate()
  birthday!: Date;

  @ApiProperty({
    description: 'User document (CPF, ID, etc)',
    example: '123.456.789-00'
  })
  @IsString()
  document!: string;

  @ApiProperty({
    description: 'User role in the system',
    example: 'developer',
    enum: ['admin', 'manager', 'developer', 'user']
  })
  @IsString()
  role!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'UUID of the user who created this user',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  createdById!: string;
}
