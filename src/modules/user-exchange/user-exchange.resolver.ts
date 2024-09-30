import { Context, Query, Resolver } from '@nestjs/graphql';
import { UserExchangeService } from './user-exchange.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/common/guards/auth.guard';
import { ResultForExchanges, UserExchangeType } from './dto/userExchangeResult.type';
import { IResults } from '@/common/dto/result.type';

@Resolver()
@UseGuards(GqlAuthGuard)
export class UserExchangeResolver {
  constructor(private readonly userExchangeRepository: UserExchangeService) {}

  @Query(() => ResultForExchanges)
  async getUserExchangesAndBalances(
    @Context() context: { req: Partial<Request> & { user: { id: string } } }
  ): Promise<IResults<UserExchangeType>> {
    const userId = context.req.user.id;
    return await this.userExchangeRepository.getUserExchangesAndBalances(userId);
  }
}
