import { Resolver, Query, Args } from '@nestjs/graphql';
import { MarketOverviewService } from './market-overview.service';
import { MarketOverview, CoinOverview, CoinDetails } from './dto/market-overview.types';

@Resolver()
export class MarketOverviewResolver {
  constructor(private marketOverviewService: MarketOverviewService) {}

  @Query(() => MarketOverview)
  async getMarketOverview(): Promise<MarketOverview> {
    return this.marketOverviewService.getMarketOverview();
  }

  @Query(() => [CoinOverview])
  async getTopMarketCap(): Promise<CoinOverview[]> {
    return this.marketOverviewService.getTopMarketCap();
  }

  @Query(() => [CoinOverview])
  async getTopClimbers(): Promise<CoinOverview[]> {
    return this.marketOverviewService.getTopClimbers();
  }

  @Query(() => [CoinOverview])
  async getTopFallers(): Promise<CoinOverview[]> {
    return this.marketOverviewService.getTopFallers();
  }

  @Query(() => CoinDetails)
  async getCoinDetails(@Args('symbol') symbol: string): Promise<CoinDetails> {
    return this.marketOverviewService.getCoinDetails(symbol);
  }
}
