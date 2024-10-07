import { Field, ObjectType } from '@nestjs/graphql';
import { createResult, createResults, IResult, IResults } from '@/common/dto/result.type';

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

  @Field({ description: '24-hour price change in symbol' })
  priceChange24h: number;

  @Field({ description: '24-hour price in USD' })
  quoteVolume24h: number;

  @Field({ description: '24-hour price change percentage' })
  priceChangePercentage24h: number;

  @Field({ description: '24-hour low price' })
  low24h: number;

  @Field({ description: '24-hour high price' })
  high24h: number;

  @Field({ description: 'All time high' })
  ath: number;

  @Field({ description: 'Circulating supply' })
  circulationSupply: number;

  @Field({ description: 'Total supply' })
  totalSupply: number;

  @Field({ description: 'Max supply', nullable: true })
  maxSupply: number;
}

@ObjectType('RawCoinDetailsFromCoingecko')
export class RawCoinDetailsFromCoingecko {
  @Field({ description: 'Symbol of the cryptocurrency' })
  symbol: string;

  @Field({ description: 'Full name of the cryptocurrency' })
  name: string;

  @Field({ description: 'market cap' })
  marketCap: number;

  @Field({ description: 'All time high' })
  ath: number;

  @Field({ description: 'circulating supply' })
  circulatingSupply: number;

  @Field({ description: 'total supply' })
  totalSupply: number;

  @Field({ description: 'max supply', nullable: true })
  maxSupply: number;

  @Field({ description: '24-hour low price' })
  low24h: number;

  @Field({ description: '24-hour high price' })
  high24h: number;
}

@ObjectType('RawCoinDetailsFromBinance')
export class RawCoinDetailsFromBinance {
  @Field({ description: 'Symbol of the cryptocurrency' })
  symbol: string;

  @Field({ description: 'Price Change' })
  priceChange: string;

  @Field({ description: 'Price Change Percentage' })
  priceChangePercent: string;

  @Field({ description: 'Last price' })
  lastPrice: string;

  @Field({ description: 'Volume' })
  volume: string;
}

// Create result types using the provided functions
export const MarketOverviewResult = createResult(MarketOverview, 'MarketOverviewResult');
export const CoinOverviewResults = createResults(CoinOverview, 'CoinOverviewResults');
export const CoinDetailsResult = createResult(CoinDetails, 'CoinDetailsResult');

// Type aliases for better readability
export type MarketOverviewResponse = IResult<MarketOverview>;
export type CoinOverviewResponse = IResults<CoinOverview>;
export type CoinDetailsResponse = IResult<CoinDetails>;
