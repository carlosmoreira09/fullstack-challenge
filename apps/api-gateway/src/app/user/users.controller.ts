import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post, Put,
    Req,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from "../../guards/auth/auth.guard";
import {UsersService} from "./users.service";
import {CreateUserDto, UpdateUserDto} from "@taskmanagerjungle/types";


@Controller('users')
export class UsersController {

    constructor(
    private readonly userService: UsersService
    ){}

    @UseGuards(AuthGuard)
    @Get('profile')
    async getUserProfile(@Req() req: any) {
        const userId = req.user?.userId;
        return await this.userService.getUserProfile(userId);
    }
    @UseGuards(AuthGuard)
    @Get(':id')
    async getOneUserProfile(@Param() id: string) {
        return await this.userService.getOneUserProfile(id);
    }

    @UseGuards(AuthGuard)
    @Get()
    async getAllUsers() {
        return await this.userService.getAllUsers();
    }

    @UseGuards(AuthGuard)
    @Post()
    async createUser(@Body() userData: CreateUserDto) {
       return await this.userService.createUser(userData);
    }
    @UseGuards(AuthGuard)
    @Patch(':id/password')
    async updatePassword(
        @Param('id') id: string,
        @Body() userData: { password: string }) {
        return await this.userService.updatePassword(id, userData);
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() userData: UpdateUserDto) {
        return await this.userService.updateUser(id, userData);
    }
}
