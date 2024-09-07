import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { ExchangeKeyService } from './exchangeKey.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/common/guards/auth.guard';
import { Result } from '@/common/dto/result.type';
import { CreateExchangeKeyInput } from './dto/new-exchangeKey.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ExchangeKeyResolver {
  constructor(private readonly exchangeKeyService: ExchangeKeyService) {}

  @Mutation(() => Result, { description: 'Create exchange key' })
  async createExchangeKey(
    @Context() cxt,
    @Args('input') input: CreateExchangeKeyInput
  ): Promise<Result> {
    const id = cxt.req.user.id;
    return await this.exchangeKeyService.createNewExchangeKey(id, input);
  }
}
