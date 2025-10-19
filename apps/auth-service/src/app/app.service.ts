import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from "../dto/login.dto";
import { RefreshTokenDTO } from "../dto/refresh-token.dto";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthEntity } from "../entities/auth.entity";
import { RefreshToken } from "../entities/refresh-token.entity";
import { IsNull, Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from "crypto";

@Injectable()
export class AppService {

    private readonly refreshTokenTtlDays = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS ?? '7', 10);

    constructor(
        @InjectRepository(AuthEntity)
        private authRepository: Repository<AuthEntity>,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
        private readonly jwtService: JwtService) {}

      async login(payload: LoginDTO) {

          const checkUsername = await this.findOneByUsername(payload.username);
          if(!checkUsername) {
                throw new UnauthorizedException("Username not found");
            }
            const checkPassword = await bcrypt.compare(payload.password, checkUsername.passwordHash);
            if(!checkPassword) {
                throw new UnauthorizedException("Invalid password");
            }

            await this.refreshTokenRepository.update(
                { userId: checkUsername.id, revokedAt: IsNull() },
                { revokedAt: new Date() }
            );

            const token = this.generateAccessToken(checkUsername);
            const refreshToken = await this.issueRefreshToken(checkUsername, payload.ip);

            return  { token, refreshToken }

      }

      async findOneByUsername(username: string) {
        return await this.authRepository.findOne({
            where: {
                username: username
            }
        })
      }

      async validateToken(token: string) {
            try{
                const decoded = this.jwtService.verify(token, {
                    secret: process.env.JWT_SECRET,
                });
                return { valid: true, userId: decoded.userId, email: decoded.email }
            } catch (error) {
                return { valid: false, userId: null, role: null }
            }

      }

      async refresh(payload: RefreshTokenDTO) {
          const { refreshToken, ip } = payload;
          const tokenHash = this.hashToken(refreshToken);

          const existingToken = await this.refreshTokenRepository.findOne({
              where: { tokenHash, revokedAt: IsNull() },
              relations: ['user'],
          });

          if(!existingToken || existingToken.revokedAt || existingToken.expiresAt <= new Date()) {
              throw new UnauthorizedException('Invalid refresh token');
          }

          const user = existingToken.user ?? await this.authRepository.findOne({
              where: { id: existingToken.userId }
          });

          if(!user) {
              throw new UnauthorizedException('User not found');
          }

          existingToken.revokedAt = new Date();
          await this.refreshTokenRepository.save(existingToken);

          const token = this.generateAccessToken(user);
          const newRefreshToken = await this.issueRefreshToken(user, ip);

          return { token, refreshToken: newRefreshToken };
      }

      private generateAccessToken(user: AuthEntity) {
          const payload = {
              userId: user.id,
              email: user.email,
          }

          return this.jwtService.sign(payload, {
              secret: process.env.JWT_SECRET,
          });
      }

      private async issueRefreshToken(user: AuthEntity, ip?: string) {
          const refreshToken = randomBytes(64).toString('hex');
          const tokenHash = this.hashToken(refreshToken);

          const refreshTokenEntity = this.refreshTokenRepository.create({
              userId: user.id,
              tokenHash,
              expiresAt: this.buildRefreshExpiryDate(),
              createdByIp: ip ?? null,
          });

          await this.refreshTokenRepository.save(refreshTokenEntity);
          return refreshToken;
      }

      private hashToken(token: string) {
          return createHash('sha256').update(token).digest('hex');
      }

      private buildRefreshExpiryDate() {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + this.refreshTokenTtlDays);
          return expiresAt;
      }
}
