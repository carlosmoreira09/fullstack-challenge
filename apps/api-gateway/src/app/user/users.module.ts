import {
    Module
} from '@nestjs/common';
import {ClientsModule} from "@nestjs/microservices/module/clients.module";
import {Transport} from "@nestjs/microservices";
import {UsersController} from "./users.controller";
import {UsersService} from "./users.service";



@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'USERS_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3005
                }
            },
            {
                name: 'AUTH_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3002
                }
            }
        ])
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: []
})
export class UsersModule {}
