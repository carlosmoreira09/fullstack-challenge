import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserPayload {
  userId: string;
  username: string;
  role: string;
}

/**
 * CurrentUser Decorator
 * 
 * Extracts the authenticated user from the request object.
 * Must be used with JwtAuthGuard or AuthGuard.
 * 
 * @example
 * ```typescript
 * @Get()
 * @UseGuards(JwtAuthGuard)
 * async findAll(@CurrentUser() user: UserPayload) {
 *   console.log(user.userId, user.username, user.role);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
