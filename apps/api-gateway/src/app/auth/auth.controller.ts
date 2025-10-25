import {Body, Controller, Post, Req} from '@nestjs/common';
import type {Request} from "express";
import {LoginDTO, RefreshTokenDTO} from "@taskmanagerjungle/types";
import {AuthService} from "./auth.service";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
    async login(@Body() payload: LoginDTO, @Req() req: Request) {
        let ip= this.extractIp(req);
        if(!ip) {
            ip = "Não identificado";
        }
        return await this.authService.login(payload,ip)
    }

    @Post('validate')
    async validate(@Body() payload: LoginDTO) {
        return await this.authService.validate(payload);
    }

    @Post('refresh')
    async refresh(@Body() payload: RefreshTokenDTO, @Req() req: Request) {
        let ip= this.extractIp(req);
        if(!ip) {
            ip = "Não identificado";
        }
        return await this.authService.refresh(payload,ip)
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
