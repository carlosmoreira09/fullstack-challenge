import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string;

  @Type(() => Date)
  @IsDate()
  birthday!: Date;

  @IsString()
  document!: string;

  @IsString()
  role!: string;

  @IsEmail()
  email!: string;

  @IsString()
  createdById!: string;
}
