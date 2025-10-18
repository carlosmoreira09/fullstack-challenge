import {Injectable, UnauthorizedException} from '@nestjs/common';
import {LoginDTO} from "./dto/login.dto";
import {JwtService} from "@nestjs/jwt";
import {InjectRepository} from "@nestjs/typeorm";
import {AuthEntity} from "./entities/auth.entity";
import {Repository} from "typeorm";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {

    constructor(
        @InjectRepository(AuthEntity)
        private authRepository: Repository<AuthEntity>,
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

            const buildToken = {
                userId: checkUsername.id,
                email: checkUsername.email
            }
            const token = this.jwtService.sign(buildToken, {
                secret: process.env.JWT_SECRET,
            });
            return  { token: token }

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
                const decoded = this.jwtService.verify(token);
                return { valid: true, userId: decoded.userId, email: decoded.email }
            } catch (error) {
                return { valid: false, userId: null, role: null }
            }

      }

      async getUserProfile(userId: string) {
            return await this.authRepository.findOne({ where: { id: userId } });
      }
}
