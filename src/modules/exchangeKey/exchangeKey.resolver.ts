import { IResult } from './../../common/dto/result.type';
import { Args, Mutation, Resolver, Context, Query } from '@nestjs/graphql';
import { ExchangeKeyService } from './exchangeKey.service';
import { UseFilters, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/common/guards/auth.guard';
import { Result } from '@/common/dto/result.type';
import { CreateExchangeKeyInput } from './dto/new-exchangeKey.input';
import { ExchangeKeyValidationPipe } from './pipe/exchangeKey-validation.pipe';
import { exchangeKeyCreateSchema } from '@/validation/schemas/exchangeKey/exchangeKey.create';
import { ExchangeKeyPipeErrorFilter } from './filter/exchangeKey-pipe-error.filter';
import { UpdateExchangeKeyInput } from './dto/update-exchangeKey.input';
import {
  exchangeKeyIdSchema,
  exchangeKeyUpdateSchema,
} from '@/validation/schemas/exchangeKey/exchangeKey.update';
import { ExchangeKeyType, ResultForExchangeKey } from './dto/exchangeKey.type';

@Resolver()
@UseGuards(GqlAuthGuard)
@UseFilters(new ExchangeKeyPipeErrorFilter())
export class ExchangeKeyResolver {
  constructor(private readonly exchangeKeyService: ExchangeKeyService) {}

  @Mutation(() => Result, { description: 'Create exchange key' })
  async createExchangeKey(
    @Context() cxt,
    @Args('input', new ExchangeKeyValidationPipe(exchangeKeyCreateSchema))
    input: CreateExchangeKeyInput
  ): Promise<Result> {
    const id = cxt.req.user.id;
    return await this.exchangeKeyService.createNewExchangeKey(id, input);
  }

  @Mutation(() => Result, {
    description: 'Update exchange key',
  })
  async updateExchangeKey(
    @Args('input', new ExchangeKeyValidationPipe(exchangeKeyUpdateSchema))
    input: UpdateExchangeKeyInput
  ): Promise<Result> {
    return await this.exchangeKeyService.updateExchangeKey(input);
  }

  @Query(() => ResultForExchangeKey, { description: 'Get exchange key by id' })
  async getExchangeKeyById(
    @Args('id', new ExchangeKeyValidationPipe(exchangeKeyIdSchema)) id: string
  ): Promise<IResult<ExchangeKeyType>> {
    return await this.exchangeKeyService.findExchangeKeyById(id);
  }
}
