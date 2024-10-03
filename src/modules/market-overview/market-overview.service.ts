import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CoinOverview, MarketOverview } from './dto/market-overview.types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarketOverviewService {
  private readonly COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
  private readonly COIN_LIST = [
    'bitcoin',
    'ethereum',
    'binancecoin',
    'solana',
    'usd-coin',
    'ripple',
    'dogecoin',
    'the-open-network',
    'cardano',
    'shiba-inu',
    'avalanche-2',
    'tron',
    'polkadot',
    'bitcoin-cash',
    'chainlink',
    'near',
    'matic-network',
    'internet-computer',
    'litecoin',
    'dai',
  ];

  constructor(private httpService: HttpService) {}

  async getMarketOverview(): Promise<MarketOverview> {
    const coinData = await this.fetchCoinData();
    const validCoinData = this.processCoinData(coinData);

    return {
      topMarketCap: this.getTopByAttribute(validCoinData, 'marketCap', 5, false),
      topClimbers: this.getTopByAttribute(validCoinData, 'priceChangePercentage24h', 5, false),
      topFallers: this.getTopByAttribute(validCoinData, 'priceChangePercentage24h', 5, true),
      top20Cryptocurrencies: this.getTopByAttribute(validCoinData, 'marketCap', 20, false),
    };
  }

  private async fetchCoinData(): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.COINGECKO_API_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: this.COIN_LIST.join(','),
          order: 'market_cap_desc',
          per_page: 20,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h,7d',
          include_24hr_vol: true,
          include_24hr_change: true,
          include_last_updated_at: true,
        },
      })
    );
    return data;
  }

  private processCoinData(coinData: any[]): CoinOverview[] {
    return coinData.map((coin) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      marketCap: coin.market_cap,
      price: coin.current_price,
      volume24h: coin.total_volume,
      priceChange24h: coin.price_change_24h,
      priceChangePercentage24h: coin.price_change_percentage_24h,
      priceChangePercentage7d: coin.price_change_percentage_7d_in_currency,
      low24h: coin.low_24h,
      high24h: coin.high_24h,
      allTimeHigh: coin.ath,
      circulationSupply: coin.circulating_supply,
      totalMaximumSupply: coin.max_supply,
    }));
  }

  private sortByAttribute(
    data: CoinOverview[],
    attribute: keyof CoinOverview,
    ascending: boolean
  ): CoinOverview[] {
    return [...data].sort((a, b) =>
      ascending
        ? (a[attribute] as number) - (b[attribute] as number)
        : (b[attribute] as number) - (a[attribute] as number)
    );
  }

  private getTopByAttribute(
    data: CoinOverview[],
    attribute: keyof CoinOverview,
    limit: number,
    ascending: boolean
  ): CoinOverview[] {
    return this.sortByAttribute(data, attribute, ascending).slice(0, limit);
  }
}
