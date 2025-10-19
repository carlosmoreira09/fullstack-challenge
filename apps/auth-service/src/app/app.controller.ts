import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {MessagePattern, Payload} from "@nestjs/microservices";
import {LoginDTO} from "../dto/login.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

    @MessagePattern("auth-login")
    async login(@Payload() payload: LoginDTO) {
      return this.appService.login(payload);
  }

  @MessagePattern("validate-token")
    async validateToken(@Payload() payload: string) {
      return this.appService.validateToken(payload);
  }

}
