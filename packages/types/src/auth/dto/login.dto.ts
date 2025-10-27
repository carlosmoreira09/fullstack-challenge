import { IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LoginDTO {
  @ApiProperty({
    description: "Username for authentication",
    example: "john.doe",
  })
  @IsString()
  username!: string;

  @ApiProperty({
    description: "User password",
    example: "SecurePassword123!",
  })
  @IsString()
  password!: string;

  @ApiPropertyOptional({
    description: "IP address of the client",
    example: "192.168.1.1",
  })
  @IsOptional()
  @IsString()
  ip?: string;
}
