import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UsePipes, UseFilters, UseGuards } from '@nestjs/common';
import { CreateUserInput } from '../user/dto/new-user.input';
import { AuthService } from './auth.service';
import { ValidationPipe } from '@/modules/auth/pipe/registration-validation.pipe';
import { userSchema } from '../../validation/schemas/auth/user.request';
import { Result } from '@/common/dto/result.type';
import { RegisterPipeErrorFilter } from './filter/register-pipe-error.filter';
import { GqlAuthGuard } from '@/common/guards/auth.guard';
import { PasswordValidationPipe } from './pipe/password-validation.pipe';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) { }

  @Mutation(() => Result, { description: 'User login' })
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<Result> {
    return await this.authService.login(email, password);
  }

  @Mutation(() => Result, { description: 'User register' })
  @UsePipes(new ValidationPipe(userSchema))
  @UseFilters(RegisterPipeErrorFilter)
  async register(@Args('input') input: CreateUserInput): Promise<Result> {
    return await this.authService.register(input);
  }

  @Mutation(() => Result, { description: 'Change password' })
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Context() cxt: { req: Partial<Request> & { user: {id: string} } },
    @Args('oldPassword') oldPassword: string,
    @Args('newPassword', new PasswordValidationPipe()) newPassword: string,
  ): Promise<Result> {
    return await this.authService.changePassword(cxt, oldPassword, newPassword);
  }
}
