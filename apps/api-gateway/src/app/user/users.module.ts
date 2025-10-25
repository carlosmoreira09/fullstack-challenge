import {
    Module
} from '@nestjs/common';
import {ClientsModule} from "@nestjs/microservices/module/clients.module";
import {Transport} from "@nestjs/microservices";
import {UsersController} from "./users.controller";



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
            }
        ])
    ],
    controllers: [UsersController],
    providers: [],
    exports: []
})
export class UsersModule {}
