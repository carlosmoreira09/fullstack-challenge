import {Body, Controller, Inject, Post} from '@nestjs/common';
import {ClientProxy} from "@nestjs/microservices";
import {LoginDTO} from "./dto/login.dto";
import {firstValueFrom} from "rxjs";

@Controller('auth')
export class AuthController {
    constructor(@Inject("AUTH_SERVICE") private readonly authClient: ClientProxy){}

    @Post('login')
    async login(@Body() payload: LoginDTO) {
        return await firstValueFrom(this.authClient.send('auth-login', payload));
    }

    @Post('validate')
    async validate(@Body() payload: LoginDTO) {
        return await firstValueFrom(this.authClient.send('validate-token', payload));
    }
}
