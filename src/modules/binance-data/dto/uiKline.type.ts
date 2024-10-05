import { createResults } from '@/common/dto/result.type';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('uiKline')
export class UiKlineType {
  @Field({ description: 'open time' })
  openTime: Date;

  @Field({ description: 'open price' })
  openPrice: string;

  @Field({ description: 'high price' })
  highPrice: string;

  @Field({ description: 'low price' })
  lowPrice: string;

  @Field({ description: 'close price' })
  closePrice: string;

  @Field({ description: 'volume' })
  volume: string;

  @Field({ description: 'close time' })
  closeTime: Date;

  @Field({ description: 'quote asset volume' })
  quoteAssetVolume: string;

  @Field({ description: 'number of trades' })
  numberOfTrades: number;

  @Field({ description: 'taker buy base asset volume' })
  takerBuyBaseAssetVolume: string;

  @Field({ description: 'taker buy quote asset volume' })
  takerBuyQuoteAssetVolume: string;
}

export const ResultForUiKlineType = createResults(UiKlineType, 'ResultForUiKlineType');
