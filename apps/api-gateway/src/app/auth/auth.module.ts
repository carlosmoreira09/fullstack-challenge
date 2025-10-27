import {
    Module
} from '@nestjs/common';
import {AuthController} from "./auth.controller";
import {Transport} from "@nestjs/microservices";
import {ClientsModule} from "@nestjs/microservices/module/clients.module";
import {AuthService} from "./auth.service";
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { JwtHelper } from '../../helpers/jwt.helper';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: '1h',
                },
            }),
            inject: [ConfigService],
        }),
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
    providers: [AuthService, JwtStrategy, JwtHelper],
    exports: [JwtStrategy, PassportModule, JwtModule, JwtHelper]
})
export class AuthModule {}
