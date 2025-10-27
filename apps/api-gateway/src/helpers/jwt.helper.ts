import {Injectable, Logger} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {reverseObjectKeys} from "@nestjs/swagger/dist/utils/reverse-object-keys.util";

export interface JwtPayload {
  sub: string;
  email: string;
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface UserPayload {
  userId: string;
  email: string;
  sub: string;
  username: string;
  role: string;
}

@Injectable()
export class JwtHelper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validate(token: string): Promise<boolean> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        Logger.error('JWT_SECRET not found in environment');
        return false;
      }
      
      await this.jwtService.verifyAsync(token, { secret });
      return true;
    } catch (error) {
        Logger.error('JWT validation error:', error.message);
      return false;
    }
  }

  async decode(token: string): Promise<UserPayload | null> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
          Logger.error('JWT_SECRET not found in environment');
        return null;
      }

      const payload = await this.jwtService.verifyAsync(token, { secret });
      
      if (!payload.sub || !payload.username) {
          Logger.error('Invalid payload structure:', payload);
        return null;
      }

      return {
          userId: payload.userId,
          sub: payload.sub,
          email: payload.email,
          username: payload.username,
          role: payload.role
      };
    } catch (error) {
        Logger.error('JWT decode error:', error.message);
      return null;
    }
  }
}
