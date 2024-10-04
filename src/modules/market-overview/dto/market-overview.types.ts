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

  @Field({ nullable: true })
  low24h?: number;

  @Field({ nullable: true })
  high24h?: number;

  @Field({ nullable: true })
  allTimeHigh?: number;

  @Field({ nullable: true })
  circulationSupply?: number;

  @Field({ nullable: true })
  totalMaximumSupply?: number;
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
