import {
    Module
} from '@nestjs/common';
import {AuthController} from "./auth.controller";
import {Transport} from "@nestjs/microservices";
import {ClientsModule} from "@nestjs/microservices/module/clients.module";
import {AuthService} from "./auth.service";



@Module({
    imports: [
        ClientsModule.register([{
            name: 'AUTH_SERVICE',
            transport: Transport.TCP,
            options: {
                host: '127.0.0.1',
                port: 3002
            }
        }
    ])],
    controllers: [AuthController],
    providers: [AuthService],
    exports: []
})
export class AuthModule {}
