import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { ExchangeKeyService } from './exchangeKey.service';
import { UseFilters, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/common/guards/auth.guard';
import { Result } from '@/common/dto/result.type';
import { CreateExchangeKeyInput } from './dto/new-exchangeKey.input';
import { ExchangeKeyValidationPipe } from './pipe/exchangeKey-validation.pipe';
import { exchangeKeyCreateSchema } from '@/validation/schemas/exchangeKey/exchangeKey.create';
import { ExchangeKeyPipeErrorFilter } from './filter/exchangeKey-pipe-error.filter';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ExchangeKeyResolver {
  constructor(private readonly exchangeKeyService: ExchangeKeyService) {}

  @Mutation(() => Result, { description: 'Create exchange key' })
  @UseFilters(new ExchangeKeyPipeErrorFilter())
  async createExchangeKey(
    @Context() cxt,
    @Args('input', new ExchangeKeyValidationPipe(exchangeKeyCreateSchema))
    input: CreateExchangeKeyInput
  ): Promise<Result> {
    const id = cxt.req.user.id;
    return await this.exchangeKeyService.createNewExchangeKey(id, input);
  }
}
