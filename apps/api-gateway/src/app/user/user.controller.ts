import {Controller, Get, Inject, Req, UseGuards} from '@nestjs/common';
import { AuthGuard } from "../../guards/auth/auth.guard";
import {ClientProxy} from "@nestjs/microservices";
import {firstValueFrom} from "rxjs";


@Controller('user')
export class UserController {

    constructor(
    @Inject("USERS_SERVICE")
    private readonly userClinet: ClientProxy
    ){}

    @UseGuards(AuthGuard)
    @Get()
    async getUserProfile(@Req() req: any) {
        const userId = req.user?.userId;
        return await firstValueFrom(this.userClinet.send("user-profile", userId));
    }
}
