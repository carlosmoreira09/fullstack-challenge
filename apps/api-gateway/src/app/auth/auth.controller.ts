import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { LoginDTO, RefreshTokenDTO } from '@taskmanagerjungle/types';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return access and refresh tokens',
  })
  @ApiBody({ type: LoginDTO })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          username: 'john.doe',
          email: 'john@example.com',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() payload: LoginDTO, @Req() req: Request) {
    let ip = this.extractIp(req);
    if (!ip) {
      ip = 'Não identificado';
    }
    return await this.authService.login(payload, ip);
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validate token',
    description: 'Validate user credentials/token',
  })
  @ApiBody({ type: LoginDTO })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async validate(@Body() payload: LoginDTO) {
    return await this.authService.validate(payload);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDTO })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() payload: RefreshTokenDTO, @Req() req: Request) {
    let ip = this.extractIp(req);
    if (!ip) {
      ip = 'Não identificado';
    }
    return await this.authService.refresh(payload, ip);
  }

  private extractIp(req: Request): string | undefined {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim();
    }
    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }
    return req.ip;
  }
}
