import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UsePipes, UseFilters, UseGuards } from '@nestjs/common';
import { CreateUserInput } from '../user/dto/new-user.input';
import { AuthService } from './auth.service';
import { ValidationPipe } from '@/modules/auth/pipe/registration-validation.pipe';
import { userSchema } from '../../validation/schemas/auth/user.request';
import { Result } from '@/common/dto/result.type';
import { RegisterPipeErrorFilter } from './filter/register-pipe-error.filter';
import { passwordUpdateSchema } from '@/validation/schemas/auth/password.update';
import { UpdatePasswordInput } from '../user/dto/update-password.input';
import { PasswordValidationPipe } from './pipe/password-validation.pipe';
import { PasswordPipeErrorFilter } from './filter/password-pipe-error.filter';
import { emailSchema } from '@/common/utils/helpers';
import { EmailValidationPipe } from './pipe/email-validation.pipe';
import { passwordResetSchema } from '@/validation/schemas/auth/password.reset';
import { ResetPasswordInput } from '../user/dto/reset-password.input';
import { ResetPasswordValidationPipe } from './pipe/reset-password-validation.pipe';
import { ResetPasswordPipeErrorFilter } from './filter/reset-password-pipe-error.filter';
import { GqlAuthGuard } from '@/common/guards/auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => Result, { description: 'User login' })
  async login(@Args('email') email: string, @Args('password') password: string): Promise<Result> {
    return await this.authService.login(email, password);
  }

  @Mutation(() => Result, { description: 'User register' })
  @UsePipes(new ValidationPipe(userSchema))
  @UseFilters(RegisterPipeErrorFilter)
  async register(@Args('input') input: CreateUserInput): Promise<Result> {
    return await this.authService.register(input);
  }

  @Mutation(() => Result, { description: 'Email Verification' })
  async verifyEmail(
    @Args('email', new EmailValidationPipe(emailSchema)) email: string,
    @Args('token') token: string
  ): Promise<Result> {
    return await this.authService.verifyEmail(email, token);
  }

  @Mutation(() => Result, { description: 'Change password' })
  @UseGuards(GqlAuthGuard)
  @UseFilters(PasswordPipeErrorFilter)
  async changePassword(
    @Context() cxt: { req: Partial<Request> & { user: { id: string } } },
    @Args('input', new PasswordValidationPipe(passwordUpdateSchema)) input: UpdatePasswordInput
  ): Promise<Result> {
    return await this.authService.changePassword(cxt, input);
  }

  @Mutation(() => Result, { description: 'Forgot password' })
  async forgotPassword(
    @Args('email', new EmailValidationPipe(emailSchema)) email: string
  ): Promise<Result> {
    return await this.authService.forgotPassword(email);
  }

  @Mutation(() => Result, { description: 'Reset password' })
  @UseFilters(ResetPasswordPipeErrorFilter)
  async resetPassword(
    @Args('input', new ResetPasswordValidationPipe(passwordResetSchema)) input: ResetPasswordInput
  ): Promise<Result> {
    const result = await this.authService.resetPassword(input);
    return result;
  }
}
