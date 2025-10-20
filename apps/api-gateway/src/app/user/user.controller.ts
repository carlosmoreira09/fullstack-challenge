import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post, Put,
    Req,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from "../../guards/auth/auth.guard";
import {ClientProxy} from "@nestjs/microservices";
import {firstValueFrom} from "rxjs";


@Controller('users')
export class UserController {

    constructor(
    @Inject("USERS_SERVICE")
    private readonly userClinet: ClientProxy,
    @Inject("AUTH_SERVICE")
    private readonly authClient: ClientProxy
    ){}

    @UseGuards(AuthGuard)
    @Get()
    async getUserProfile(@Req() req: any) {
        const userId = req.user?.userId;
        return await firstValueFrom(this.userClinet.send("user-profile", userId));
    }

    @UseGuards(AuthGuard)
    @Get('all')
    async getAllUsers() {
        return await firstValueFrom(this.userClinet.send("get-all-users", {}));
    }

    @UseGuards(AuthGuard)
    @Post()
    async createUser(@Body() userData: any) {
       const createAuth = await firstValueFrom(this.authClient.send('create-auth', userData))
        if(createAuth) {
            return await firstValueFrom(this.userClinet.send("create-user", userData));
        } else {
            throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
        }
    }
    @UseGuards(AuthGuard)
    @Patch(':id/password')
    async updatePassword(
        @Param('id') id: string,
        @Body() userData: { password: string }) {
        return await firstValueFrom(this.authClient.send('update-password',{...userData, id: id}))
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() userData: any) {
        return await firstValueFrom(this.userClinet.send('update-user',{...userData, id: id}))
    }
}
