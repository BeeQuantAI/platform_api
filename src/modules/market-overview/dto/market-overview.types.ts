import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoinOverview {
  @Field()
  symbol: string;

  @Field()
  name: string;

  @Field()
  marketCap: number;

  @Field()
  price: number;

  @Field()
  volume24h: number;

  @Field()
  priceChange24h: number;

  @Field()
  priceChangePercentage24h: number;

  @Field()
  priceChangePercentage7d: number;

  @Field()
  low24h: number;

  @Field()
  high24h: number;

  @Field()
  allTimeHigh: number;

  @Field()
  circulationSupply: number;

  @Field({ nullable: true })
  totalMaximumSupply: number;
}

@ObjectType()
export class MarketOverview {
  @Field(() => [CoinOverview])
  topMarketCap: CoinOverview[];

  @Field(() => [CoinOverview])
  topClimbers: CoinOverview[];

  @Field(() => [CoinOverview])
  topFallers: CoinOverview[];

  @Field(() => [CoinOverview])
  top20Cryptocurrencies: CoinOverview[];
}
