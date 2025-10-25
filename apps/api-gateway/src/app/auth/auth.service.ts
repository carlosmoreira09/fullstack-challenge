import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {LoginDTO, RefreshTokenDTO} from "@taskmanagerjungle/types";

@Injectable()
export class AuthService {

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async login(payload: LoginDTO, ip: string) {
      const loginPayload = {
          ...payload,
          ip: ip,
      };
      return await firstValueFrom(this.authClient.send('auth-login', loginPayload));
  }

  async validate(payload: LoginDTO) {
      return await firstValueFrom(this.authClient.send('validate-token', payload));
  }
  async refresh(payload: RefreshTokenDTO, ip: string) {
      const refreshPayload = {
          ...payload,
          ip,
      };
      await firstValueFrom(this.authClient.send('auth-refresh', refreshPayload));
  }
}
