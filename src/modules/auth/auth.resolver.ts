import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UsePipes } from '@nestjs/common';
import { UseFilters } from '@nestjs/common';
import { CreateUserInput } from '../user/dto/new-user.input';
import { AuthService } from './auth.service';
import { ValidationPipe } from '@/modules/auth/pipe/registration-validation.pipe';
import { userSchema } from '../../validation/schemas/auth/user.request';
import { Result } from '@/common/dto/result.type';
import { RegisterPipeErrorFilter } from './filter/register-pipe-error.filter';

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
}
