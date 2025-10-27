import {CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {firstValueFrom} from 'rxjs';
import {JwtService} from "@nestjs/jwt";
import {ClientProxy} from "@nestjs/microservices";

/**
 * AuthGuard - Hybrid authentication guard
 * 
 * This guard supports two validation modes:
 * 1. Local JWT validation using JwtService (faster, recommended)
 * 2. Remote validation via AUTH_SERVICE microservice (fallback)
 * 
 * Usage:
 * - Use JwtAuthGuard for standard JWT validation (recommended)
 * - Use this guard when you need microservice-based validation
 */
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy,
        private readonly jwtService: JwtService
    ){}

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            throw new UnauthorizedException("Authorization header missing");
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            throw new UnauthorizedException("Invalid authorization header format");
        }

        const token = parts[1];

        if(!token) {
            throw new UnauthorizedException("Missing token");
        }

        try {
            // Try local JWT validation first (faster)
            const payload = await this.jwtService.verifyAsync(token);
            req.user = { 
                userId: payload.sub, 
                username: payload.username,
                role: payload.role 
            };
            return true;
        } catch (error) {
            // Fallback to microservice validation
            try {
                const result = await firstValueFrom(
                    this.authClient.send("validate-token", token)
                );
                
                if(!result.valid) {
                    throw new UnauthorizedException("Invalid token");
                }

                req.user = { 
                    userId: result.userId, 
                    username: result.username,
                    role: result.role 
                };

                return true;
            } catch (microserviceError) {
                throw new UnauthorizedException("Token validation failed");
            }
        }
    }
}
