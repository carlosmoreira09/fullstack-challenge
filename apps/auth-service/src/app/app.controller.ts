import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import {MessagePattern, Payload} from "@nestjs/microservices";
import {LoginDTO} from "../dto/login.dto";
import {RefreshTokenDTO} from "../dto/refresh-token.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

    @MessagePattern({ cmd: 'health' })
    async health() {
        return {
            status: 'ok',
            service: 'auth-service',
            message: 'Service is healthy',
            timestamp: new Date().toISOString(),
        };
    }

    @MessagePattern("auth-login")
    async login(@Payload() payload: LoginDTO) {
      return this.appService.login(payload);
  }

    @MessagePattern("create-auth")
    async createAuth(@Payload() payload: any) {
        return this.appService.createAuth(payload);
    }

    @MessagePattern("update-password")
    async updatePassword(@Payload() data: {id: string, password: string}) {
        return this.appService.updatePassword(data.id, data.password);
    }

      @MessagePattern("validate-token")
        async validateToken(@Payload() payload: string) {
          return this.appService.validateToken(payload);
      }

    @MessagePattern("auth-refresh")
    async refresh(@Payload() payload: RefreshTokenDTO) {
        return this.appService.refresh(payload);
    }

}
