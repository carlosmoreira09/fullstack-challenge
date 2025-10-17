import {CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {firstValueFrom, Observable} from 'rxjs';
import {JwtService} from "@nestjs/jwt";
import {ClientProxy} from "@nestjs/microservices";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(@Inject("AUTH_SERVICE") private readonly authClient: ClientProxy){}

    async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers["authorization"];

    const token = authHeader.split(" ")[1];

    if(!token) {
        throw new UnauthorizedException("missing token");
    }

    const result = await firstValueFrom(this.authClient.send("validate-token", token))
    if(!result.valid) {
        throw new UnauthorizedException("invalid token");
    }

    req.user = { userId: result.userId, role: result.role };

    return true;
  }
}
