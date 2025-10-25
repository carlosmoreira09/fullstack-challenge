import {
    HttpException,
    HttpStatus,
    Inject, Injectable,
} from '@nestjs/common';
import {ClientProxy} from "@nestjs/microservices";
import {firstValueFrom} from "rxjs";
import {CreateUserDto, UpdateUserDto} from "@taskmanagerjungle/types";


@Injectable()
export class UsersService {

    constructor(
    @Inject("USERS_SERVICE")
    private readonly userClient: ClientProxy,
    @Inject("AUTH_SERVICE")
    private readonly authClient: ClientProxy
    ){}

    async getUserProfile(userId: string) {
        return await firstValueFrom(this.userClient.send("user-profile", userId));
    }
    async getOneUserProfile(id: string) {
        return await firstValueFrom(this.userClient.send("get-one-user-profile", id));
    }


    async getAllUsers() {
        return await firstValueFrom(this.userClient.send("list-users", {}));
    }

    async createUser(userData: CreateUserDto) {
       const createAuth = await firstValueFrom(this.authClient.send('create-auth', userData))
        if(createAuth) {
            return await firstValueFrom(this.userClient.send("create-user", userData));
        } else {
            throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
        }
    }

    async updatePassword(id: string, userData: { password: string }) {
        return await firstValueFrom(this.authClient.send('update-password',{...userData, id: id}))
    }

    async updateUser( id: string, userData: UpdateUserDto) {
        return await firstValueFrom(this.userClient.send('update-user',{...userData, id: id}))
    }
}
