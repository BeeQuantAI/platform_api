import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '@/modules/auth/auth.service';
import { AccessTokenGuard } from './jwt-access-auth.guard';
import { RefreshJwtAuthGuard } from './jwt-refresh-auth.guard';
import { UserService } from '@/modules/user/user.service';
import { TokenService } from '@/modules/auth/token.service';
import { CustomException } from '@/common/exceptions/custom-exception';
import { ACCESS_TOKENS_NOT_SAME, BOTH_TOKENS_INVALID } from '@/common/constants/code';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly refreshJwtAuthGuard: RefreshJwtAuthGuard,
    private readonly userService: UserService,
    private readonly tokenService: TokenService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();
    const res = ctx.res;
    const req = ctx.req;

    const { accessTokenFromRequest, accessTokenFromDB } = await this.tokenService.processToken(req);

    if (accessTokenFromRequest !== accessTokenFromDB) {
      throw new CustomException('Access tokens are not the same', ACCESS_TOKENS_NOT_SAME);
    }

    try {
      const canActivate = await this.accessTokenGuard.canActivate(context);
      if (canActivate) {
        return true;
      }
    } catch (err) {
      try {
        const canActivate = await this.refreshJwtAuthGuard.canActivate(context);
        if (canActivate) {
          const user = ctx.req.user;
          const newAccessToken = await this.authService.generateAccessToken(user.id);
          await this.userService.update(user.id, { accessToken: newAccessToken });
          res.setHeader('New-Access-Token', newAccessToken);
          return true;
        }
      } catch (refreshTokenErr) {
        throw new CustomException('Both tokens are invalid', BOTH_TOKENS_INVALID);
      }
    }
  }
}
