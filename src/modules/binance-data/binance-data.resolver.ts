import { Args, Field, ObjectType, Query, Resolver, Subscription } from '@nestjs/graphql';
import { BinanceDataService } from './binance-data.service';
import { GetUiKlineDto } from './dto/get-uiKline.dto';
import { ResultForUiKlineType, UiKlineType } from './dto/uiKline.type';
import { UseFilters, UsePipes } from '@nestjs/common';
import { uiKlineQuerySchema } from '@/validation/schemas/binance-data/uiKline.query';
import { BinanceDateValidationPipe } from './pipe/binance-data-validation.pipe';
import { BinanceDataPipeErrorFilter } from './filter/binance-data.filter';
import { IResults } from '@/common/dto/result.type';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Resolver()
export class BinanceDataResolver {
  private accumulatedNum = 0;

  constructor(private binanceDataService: BinanceDataService) {}

  @Cron(CronExpression.EVERY_SECOND)
  handleCron() {
    this.accumulatedNum += 1;
    const currentTime = new Date().toISOString();
    pubSub.publish('numberUpdated', {
      accumulatedNumberAndTime: {
        accumulatedNumber: this.accumulatedNum,
        currentTime,
      },
    });
  }

  @Query(() => Number, { description: 'Get accumulated number' })
  getAccumulatedNum(): number {
    return this.accumulatedNum;
  }

  @Subscription(() => AccumulatedNumberAndTimeType, {
    description: 'Subscribe to accumulated number and current server time updates every second',
  })
  accumulatedNumberAndTime() {
    return pubSub.asyncIterator('numberUpdated');
  }

  @Query(() => ResultForUiKlineType, { description: 'Get uiKlines' })
  @UsePipes(new BinanceDateValidationPipe(uiKlineQuerySchema))
  @UseFilters(new BinanceDataPipeErrorFilter())
  async getUiKlines(@Args('input') input: GetUiKlineDto): Promise<IResults<UiKlineType>> {
    return await this.binanceDataService.getUiKlinesData(input);
  }
}

@ObjectType()
class AccumulatedNumberAndTimeType {
  @Field(() => Number)
  accumulatedNumber: number;

  @Field(() => String)
  currentTime: string;
}
