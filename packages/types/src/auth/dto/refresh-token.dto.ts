import { IsOptional, IsString } from "class-validator";

export class RefreshTokenDTO {
    @IsString()
    refreshToken!: string;

    @IsOptional()
    @IsString()
    ip?: string;
}
