import { Args, Query, Resolver } from '@nestjs/graphql';
import { BinanceDataService } from './binance-data.service';
import { GetUiKlineDto } from './dto/get-uiKline.dto';
import { ResultForUiKlineType, UiKlineType } from './dto/uiKline.type';
import { UseFilters, UsePipes } from '@nestjs/common';
import { uiKlineQuerySchema } from '@/validation/schemas/binance-data/uiKline.query';
import { BinanceDateValidationPipe } from './pipe/binance-data-validation.pipe';
import { BinanceDataPipeErrorFilter } from './filter/binance-data.filter';
import { IResults } from '@/common/dto/result.type';

@Resolver()
export class BinanceDataResolver {
  constructor(private binanceDataService: BinanceDataService) {}

  @Query(() => ResultForUiKlineType, { description: 'Get uiKlines' })
  @UsePipes(new BinanceDateValidationPipe(uiKlineQuerySchema))
  @UseFilters(new BinanceDataPipeErrorFilter())
  async getUiKlines(@Args('input') input: GetUiKlineDto): Promise<IResults<UiKlineType>> {
    return await this.binanceDataService.getUiKlinesData(input);
  }
}
