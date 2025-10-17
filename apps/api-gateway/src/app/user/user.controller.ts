import {Controller, Get, Inject, Req, UseGuards} from '@nestjs/common';
import { AuthGuard } from "../../guards/auth/auth.guard";
import {ClientProxy} from "@nestjs/microservices";
import {firstValueFrom} from "rxjs";


@Controller('user')
export class UserController {

    constructor(@Inject("AUTH_SERVICE") private readonly authClient: ClientProxy){}

    @UseGuards(AuthGuard)
    @Get()
    async getUserProfile(@Req() req: any) {
        const userId = req.user?.userId;
        console.log(req.user)
        return await firstValueFrom(this.authClient.send("user-profile", userId));
    }
}
