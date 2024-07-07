import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '@/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipAuth = this.reflector.get<boolean>('skipAuth', context.getHandler());

    if (skipAuth) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();

    const token = this.extractJwtFromCookie(ctx.req);

    if (!token) {
      return false;
    }

    try {
      this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        const decodedToken = this.jwtService.decode(token) as any;
        const userId = decodedToken.id;

        const newAccessToken = await this.authService.refreshAccessToken(userId);

        if (newAccessToken) {
          this.setAccessTokenCookie(ctx.res, newAccessToken);
          return true; 
        } else {
          return false; 
        }
      } else {
        return false;
      }
    }
  }

  private extractJwtFromCookie(req: any): string | null {
    return req.cookies['access_token'] || null;
  }

  private setAccessTokenCookie(res: any, token: string): void {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000 * 12,
      sameSite: 'none',
    });
  }
}
