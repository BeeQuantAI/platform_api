import { createResults } from '@/common/dto/result.type';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('CoinOverview')
export class CoinOverview {
  @Field({ description: 'Symbol of the cryptocurrency' })
  symbol: string;

  @Field({ description: 'Full name of the cryptocurrency' })
  name: string;

  @Field({ description: 'Market capitalization of the cryptocurrency' })
  marketCap: number;

  @Field({ description: 'Current price of the cryptocurrency' })
  price: number;

  @Field({ description: '24-hour trading volume' })
  volume24h: number;

  @Field({ description: '24-hour price change' })
  priceChange24h: number;

  @Field({ description: '24-hour price change percentage' })
  priceChangePercentage24h: number;

  @Field({ description: '7-day price change percentage' })
  priceChangePercentage7d: number;
}

@ObjectType('MarketOverview')
export class MarketOverview {
  @Field(() => [CoinOverview], { description: 'Top cryptocurrencies by market cap' })
  topMarketCap: CoinOverview[];

  @Field(() => [CoinOverview], { description: 'Top climbing cryptocurrencies' })
  topClimbers: CoinOverview[];

  @Field(() => [CoinOverview], { description: 'Top falling cryptocurrencies' })
  topFallers: CoinOverview[];

  @Field(() => [CoinOverview], { description: 'Top 20 cryptocurrencies' })
  top20Cryptocurrencies: CoinOverview[];
}

@ObjectType('CoinDetails')
export class CoinDetails {
  @Field({ description: 'Symbol of the cryptocurrency' })
  symbol: string;

  @Field({ description: 'Full name of the cryptocurrency' })
  name: string;

  @Field({ description: 'Current price of the cryptocurrency' })
  price: number;

  @Field({ description: '24-hour trading volume' })
  volume24h: number;

  @Field({ description: '24-hour price change' })
  priceChange24h: number;

  @Field({ description: '24-hour price change percentage' })
  priceChangePercentage24h: number;

  @Field({ description: '24-hour low price' })
  low24h: number;

  @Field({ description: '24-hour high price' })
  high24h: number;
}

export const ResultForCoinOverviewType = createResults(CoinOverview, 'ResultForCoinOverviewType');
export const ResultForMarketOverviewType = createResults(
  MarketOverview,
  'ResultForMarketOverviewType'
);
export const ResultForCoinDetailsType = createResults(CoinDetails, 'ResultForCoinDetailsType');
