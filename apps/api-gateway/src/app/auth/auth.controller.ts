import {Body, Controller, Inject, Post, Req} from '@nestjs/common';
import {ClientProxy} from "@nestjs/microservices";
import * as LoginDTOModule from "./dto/login.dto";
import {firstValueFrom} from "rxjs";
import type {Request} from "express";
import * as RefreshTokenDTOModule from "./dto/refresh-token.dto";

@Controller('auth')
export class AuthController {
    constructor(@Inject("AUTH_SERVICE") private readonly authClient: ClientProxy){}

    @Post('login')
    async login(@Body() payload: LoginDTOModule.LoginDTO, @Req() req: Request) {
        const loginPayload = {
            ...payload,
            ip: this.extractIp(req),
        };
        return await firstValueFrom(this.authClient.send('auth-login', loginPayload));
    }

    @Post('validate')
    async validate(@Body() payload: LoginDTOModule.LoginDTO) {
        return await firstValueFrom(this.authClient.send('validate-token', payload));
    }

    @Post('refresh')
    async refresh(@Body() payload: RefreshTokenDTOModule.RefreshTokenDTO, @Req() req: Request) {
        const refreshPayload = {
            ...payload,
            ip: this.extractIp(req),
        };
        return await firstValueFrom(this.authClient.send('auth-refresh', refreshPayload));
    }


    private extractIp(req: Request): string | undefined {
        const forwarded = req.headers['x-forwarded-for'];
        if(typeof forwarded === 'string') {
            return forwarded.split(',')[0]?.trim();
        }
        if(Array.isArray(forwarded)) {
            return forwarded[0];
        }
        return req.ip;
    }
}
