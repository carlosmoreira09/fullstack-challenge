import { IsDate, IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
  @ApiProperty({
    description: "User unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  id!: string;

  @ApiProperty({
    description: "Full name of the user",
    example: "John Doe",
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: "User birthday",
    example: "1990-01-15T00:00:00.000Z",
    type: Date,
  })
  @IsDate()
  birthday!: Date;

  @ApiProperty({
    description: "User document",
    example: "123.456.789-00",
  })
  @IsString()
  document!: string;

  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
  })
  @IsString()
  email!: string;

  @ApiProperty({
    description: "User role",
    example: "developer",
    enum: ["admin", "manager", "developer", "user"],
  })
  @IsString()
  role!: string;

  @ApiProperty({
    description: "UUID of the user who created this user",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  createdById!: string;

  @ApiProperty({
    description: "User creation timestamp",
    example: "2024-01-15T10:30:00.000Z",
    type: Date,
  })
  @IsDate()
  created_at!: Date;

  @ApiProperty({
    description: "User last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
    type: Date,
  })
  @IsDate()
  updated_at!: Date;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  document?: string;
  role?: string;
  birthday?: string;
  createdById?: number;
}
