import { Resolver, Query, Args, Directive, Subscription } from '@nestjs/graphql';
import { MarketOverviewService } from './market-overview.service';
import {
  MarketOverviewResult,
  CoinOverviewResults,
  CoinDetailsResult,
  MarketOverviewResponse,
  CoinOverviewResponse,
  CoinDetailsResponse,
} from './dto/market-overview.types';
import { SymbolValidationPipe, ValidSymbol } from './pipe/market-overview-validation.pipe';
import { PubSub } from 'graphql-subscriptions';
import { Interval } from '@nestjs/schedule';

const subPub = new PubSub();

@Resolver()
export class MarketOverviewResolver {
  constructor(private marketOverviewService: MarketOverviewService) {}

  @Query(() => MarketOverviewResult)
  async getMarketOverview(): Promise<MarketOverviewResponse> {
    return this.marketOverviewService.getMarketOverview();
  }

  @Query(() => CoinDetailsResult)
  async getCoinDetails(
    @Args('symbol', SymbolValidationPipe) symbol: ValidSymbol
  ): Promise<CoinDetailsResponse> {
    return this.marketOverviewService.getCoinDetails(symbol);
  }

  @Query(() => CoinOverviewResults)
  @Directive('@deprecated(reason: "Use getMarketOverview instead")')
  async getTopMarketCap(): Promise<CoinOverviewResponse> {
    return this.marketOverviewService.getTopMarketCap();
  }

  @Query(() => CoinOverviewResults)
  @Directive('@deprecated(reason: "Use getMarketOverview instead")')
  async getTopClimbers(): Promise<CoinOverviewResponse> {
    return this.marketOverviewService.getTopClimbers();
  }

  @Query(() => CoinOverviewResults)
  @Directive('@deprecated(reason: "Use getMarketOverview instead")')
  async getTopFallers(): Promise<CoinOverviewResponse> {
    return this.marketOverviewService.getTopFallers();
  }

  @Query(() => CoinOverviewResults)
  @Directive('@deprecated(reason: "Use getMarketOverview instead")')
  async getTop20Cryptocurrencies(): Promise<CoinOverviewResponse> {
    return this.marketOverviewService.getTop20Cryptocurrencies();
  }

  @Subscription(() => MarketOverviewResult, {
    resolve: (value) => value.updateMarketOverview,
  })
  updateMarketOverview() {
    return subPub.asyncIterator('updateMarketOverview');
  }

  @Interval(15000)
  async publishUpdateMarketOverview(): Promise<MarketOverviewResponse> {
    const updateMarketOverview = await this.marketOverviewService.getMarketOverview();
    subPub.publish('updateMarketOverview', { updateMarketOverview });
    return updateMarketOverview;
  }
}
