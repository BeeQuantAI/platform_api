import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CoinOverview, MarketOverview } from './dto/market-overview.types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarketOverviewService {
  private readonly BINANCE_API_URL = 'https://api.binance.com/api/v3';
  private readonly COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
  private readonly COIN_LIST = [
    'BTC',
    'ETH',
    'BNB',
    'SOL',
    'USDC',
    'XRP',
    'DOGE',
    'TON',
    'ADA',
    'SHIB',
    'AVAX',
    'TRX',
    'DOT',
    'BCH',
    'LINK',
    'NEAR',
    'MATIC',
    'ICP',
    'LTC',
    'DAI',
  ];

  constructor(private httpService: HttpService) {}

  async getMarketOverview(): Promise<MarketOverview> {
    const tickerData = await this.fetchTickerData();
    const coinData = await this.processCoinData(tickerData);

    return {
      topMarketCap: this.getTopByAttribute(coinData, 'marketCap', 5),
      topClimbers: this.getTopByAttribute(coinData, 'priceChangePercentage24h', 5),
      topFallers: this.getTopByAttribute(coinData, 'priceChangePercentage24h', 5, true),
      top20Cryptocurrencies: coinData,
    };
  }

  async getCoinDetails(symbol: string): Promise<CoinOverview | null> {
    const tickerData = await this.fetchTickerData();
    const coinData = await this.processCoinData(tickerData);
    return coinData.find((coin) => coin.symbol === symbol) || null;
  }

  async getCoinHistoryDetails(symbol: string): Promise<Partial<CoinOverview> | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${this.COINGECKO_API_URL}/coins/${this.getFullName(symbol).toLowerCase()}`
        )
      );
      return {
        symbol,
        name: this.getFullName(symbol),
        allTimeHigh: data.market_data.ath.usd,
        circulationSupply: data.market_data.circulating_supply,
        totalMaximumSupply: data.market_data.total_supply,
      };
    } catch (error) {
      console.error(`Error fetching data from CoinGecko for ${symbol}:`, error);
      return null;
    }
  }

  private async fetchTickerData(): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.BINANCE_API_URL}/ticker/24hr`)
    );
    return data.filter((ticker) => this.COIN_LIST.includes(ticker.symbol.replace('USDT', '')));
  }

  private async processCoinData(tickerData: any[]): Promise<CoinOverview[]> {
    return Promise.all(
      tickerData.map(async (ticker) => {
        const symbol = ticker.symbol.replace('USDT', '');
        const priceChangePercentage7d = await this.calculate7DayPriceChange(symbol);
        return {
          symbol,
          name: this.getFullName(symbol),
          marketCap: parseFloat(ticker.weightedAvgPrice) * parseFloat(ticker.volume),
          price: parseFloat(ticker.lastPrice),
          volume24h: parseFloat(ticker.volume),
          priceChange24h: parseFloat(ticker.priceChange),
          priceChangePercentage24h: parseFloat(ticker.priceChangePercent),
          priceChangePercentage7d,
          low24h: parseFloat(ticker.lowPrice),
          high24h: parseFloat(ticker.highPrice),
        };
      })
    );
  }

  private async calculate7DayPriceChange(symbol: string): Promise<number> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.BINANCE_API_URL}/klines`, {
          params: {
            symbol: `${symbol}USDT`,
            interval: '1d',
            limit: 8,
          },
        })
      );

      if (data.length < 8) return 0;

      const oldPrice = parseFloat(data[0][1]); // Opening price 7 days ago
      const newPrice = parseFloat(data[7][4]); // Closing price of the most recent day

      return ((newPrice - oldPrice) / oldPrice) * 100;
    } catch (error) {
      console.error(`Error fetching 7-day price change from Binance for ${symbol}:`, error);
      return 0;
    }
  }

  private getTopByAttribute(
    data: CoinOverview[],
    attribute: keyof CoinOverview,
    limit: number,
    reverse = false
  ): CoinOverview[] {
    return [...data]
      .sort((a, b) =>
        reverse
          ? (a[attribute] as number) - (b[attribute] as number)
          : (b[attribute] as number) - (a[attribute] as number)
      )
      .slice(0, limit);
  }

  private getFullName(symbol: string): string {
    const nameMap = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      BNB: 'BNB',
      SOL: 'Solana',
      USDC: 'USD Coin',
      XRP: 'XRP',
      DOGE: 'Dogecoin',
      TON: 'Toncoin',
      ADA: 'Cardano',
      SHIB: 'Shiba Inu',
      AVAX: 'Avalanche',
      TRX: 'Tron',
      DOT: 'Polkadot',
      BCH: 'Bitcoin Cash',
      LINK: 'Chainlink',
      NEAR: 'NEAR Protocol',
      MATIC: 'Polygon',
      ICP: 'Internet Computer',
      LTC: 'Litecoin',
      DAI: 'Dai',
    };
    return nameMap[symbol] || symbol;
  }
}
