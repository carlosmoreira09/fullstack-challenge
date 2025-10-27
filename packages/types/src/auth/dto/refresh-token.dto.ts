import { IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RefreshTokenDTO {
  @ApiProperty({
    description: "Refresh token for obtaining new access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString()
  refreshToken!: string;

  @ApiPropertyOptional({
    description: "IP address of the client",
    example: "192.168.1.1",
  })
  @IsOptional()
  @IsString()
  ip?: string;
}
