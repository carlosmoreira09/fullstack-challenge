import {Injectable, ExecutionContext, UnauthorizedException, Logger} from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import {JwtHelper, UserPayload} from '../../helpers/jwt.helper';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
    constructor(
        private readonly helper: JwtHelper,
        private readonly reflector: Reflector,
    ) {
        super();
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        if (request.method === 'OPTIONS') {
            return true;
        }

        try {
            await super.canActivate(context);
        } catch (error) {
            Logger.error('JwtAuthGuard: super.canActivate failed:', error.message);
        }

        const req = context.switchToHttp().getRequest();
        const authHeader: string | undefined = req?.headers?.['authorization'];
        const bearer = authHeader?.startsWith('Bearer ')
            ? authHeader.substring('Bearer '.length)
            : undefined;
        let token: string | undefined = bearer;
        if (!token) {
            token = req?.cookies?.token;
            if (!token) {
                const cookieHeader: string | undefined = req?.headers?.cookie;
                if (cookieHeader) {
                    const parts = cookieHeader.split(';').map((p) => p.trim());
                    for (const part of parts) {
                        const [k, v] = part.split('=');
                        if (k === 'token') {
                            token = decodeURIComponent(v || '');
                            break;
                        }
                    }
                }
            }
        }

        let user: UserPayload | null = null;
        if (token) {
            const isValid = await this.helper.validate(token);
            if (isValid) {
                user = await this.helper.decode(token);
            }
        }
        
        if (user) {
            req.user = user;
        }

        return !!(user);
    }
}