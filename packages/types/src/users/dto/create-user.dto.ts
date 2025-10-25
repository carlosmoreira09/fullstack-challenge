import {IsDate, IsEmail, IsString, IsUUID} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsDate()
  birthday!: Date;

  @IsString()
  document!: string;

  @IsString()
  role!: string;

  @IsEmail()
  email!: string;

  @IsUUID()
  createdById!: string;
}
