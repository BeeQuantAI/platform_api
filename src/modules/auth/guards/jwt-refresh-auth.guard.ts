import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { CustomException } from '@/common/exceptions/custom-exception';
import { ACCESS_TOKENS_NOT_SAME } from '@/common/constants/code';

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('jwt-refresh-token') {
  getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw new CustomException('Access tokens are not the same', ACCESS_TOKENS_NOT_SAME);
    }
    return user;
  }
}
