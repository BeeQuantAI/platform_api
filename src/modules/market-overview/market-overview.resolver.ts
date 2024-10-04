import { Resolver, Query, Args } from '@nestjs/graphql';
import { MarketOverviewService } from './market-overview.service';
import { MarketOverview, CoinOverview } from './dto/market-overview.types';

@Resolver()
export class MarketOverviewResolver {
  constructor(private marketOverviewService: MarketOverviewService) {}

  @Query(() => MarketOverview)
  async getMarketOverview(): Promise<MarketOverview> {
    return this.marketOverviewService.getMarketOverview();
  }

  @Query(() => [CoinOverview])
  async getTopMarketCap(): Promise<CoinOverview[]> {
    const overview = await this.marketOverviewService.getMarketOverview();
    return overview.topMarketCap;
  }

  @Query(() => [CoinOverview])
  async getTopClimbers(): Promise<CoinOverview[]> {
    const overview = await this.marketOverviewService.getMarketOverview();
    return overview.topClimbers;
  }

  @Query(() => [CoinOverview])
  async getTopFallers(): Promise<CoinOverview[]> {
    const overview = await this.marketOverviewService.getMarketOverview();
    return overview.topFallers;
  }

  @Query(() => [CoinOverview])
  async getTop20Cryptocurrencies(): Promise<CoinOverview[]> {
    const overview = await this.marketOverviewService.getMarketOverview();
    return overview.top20Cryptocurrencies;
  }

  @Query(() => CoinOverview, { nullable: true })
  async getCoinDetails(@Args('symbol') symbol: string): Promise<CoinOverview | null> {
    return this.marketOverviewService.getCoinDetails(symbol);
  }

  @Query(() => CoinOverview, { nullable: true })
  async getCoinHistoryDetails(
    @Args('symbol') symbol: string
  ): Promise<Partial<CoinOverview> | null> {
    return this.marketOverviewService.getCoinHistoryDetails(symbol);
  }
}
