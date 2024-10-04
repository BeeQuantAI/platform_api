import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CoinOverview, MarketOverview, CoinDetails } from './dto/market-overview.types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarketOverviewService {
  private readonly BINANCE_API_URL = 'https://api.binance.com/api/v3';
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
  private readonly STABLE_COINS = ['USDC', 'DAI'];

  constructor(private httpService: HttpService) {}

  async getMarketOverview(): Promise<MarketOverview> {
    const tickerData = await this.fetchTickerData();
    const sevenDayChangeData = await this.fetchSevenDayChangeData();
    const coinData = this.processCoinData(tickerData, sevenDayChangeData);
    const validCoinData = this.filterAndDeduplicate(coinData);

    const nonStableCoins = validCoinData.filter((coin) => !this.STABLE_COINS.includes(coin.symbol));

    return {
      topMarketCap: this.getTopByAttribute(validCoinData, 'marketCap', 5),
      topClimbers: this.getTopByAttribute(nonStableCoins, 'priceChangePercentage24h', 5),
      topFallers: this.getTopByAttribute(nonStableCoins, 'priceChangePercentage24h', 5, true),
      top20Cryptocurrencies: this.getTopByAttribute(validCoinData, 'marketCap', 20),
    };
  }

  async getTopMarketCap(): Promise<CoinOverview[]> {
    const tickerData = await this.fetchTickerData();
    const coinData = this.processCoinData(tickerData, new Map());
    const validCoinData = this.filterAndDeduplicate(coinData);
    return this.getTopByAttribute(validCoinData, 'marketCap', 5);
  }

  async getTopClimbers(): Promise<CoinOverview[]> {
    const tickerData = await this.fetchTickerData();
    const coinData = this.processCoinData(tickerData, new Map());
    const validCoinData = this.filterAndDeduplicate(coinData);
    const nonStableCoins = validCoinData.filter((coin) => !this.STABLE_COINS.includes(coin.symbol));
    return this.getTopByAttribute(nonStableCoins, 'priceChangePercentage24h', 5);
  }

  async getTopFallers(): Promise<CoinOverview[]> {
    const tickerData = await this.fetchTickerData();
    const coinData = this.processCoinData(tickerData, new Map());
    const validCoinData = this.filterAndDeduplicate(coinData);
    const nonStableCoins = validCoinData.filter((coin) => !this.STABLE_COINS.includes(coin.symbol));
    return this.getTopByAttribute(nonStableCoins, 'priceChangePercentage24h', 5, true);
  }

  async getCoinDetails(symbol: string): Promise<CoinDetails> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.BINANCE_API_URL}/ticker/24hr`, {
        params: { symbol: `${symbol}USDT` },
      })
    );

    return {
      symbol,
      name: this.getFullName(symbol),
      price: parseFloat(data.lastPrice),
      volume24h: parseFloat(data.volume),
      priceChange24h: parseFloat(data.priceChange),
      priceChangePercentage24h: parseFloat(data.priceChangePercent),
      low24h: parseFloat(data.lowPrice),
      high24h: parseFloat(data.highPrice),
    };
  }

  private async fetchTickerData(): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.BINANCE_API_URL}/ticker/24hr`)
    );
    return data.filter(
      (ticker) =>
        this.COIN_LIST.includes(ticker.symbol.replace('USDT', '')) &&
        parseFloat(ticker.lastPrice) > 0
    );
  }

  private async fetchSevenDayChangeData(): Promise<Map<string, number>> {
    const sevenDayChangeMap = new Map<string, number>();
    const currentTime = Date.now();
    const sevenDaysAgo = currentTime - 7 * 24 * 60 * 60 * 1000;

    for (const coin of this.COIN_LIST) {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.BINANCE_API_URL}/klines`, {
          params: {
            symbol: `${coin}USDT`,
            interval: '1d',
            startTime: sevenDaysAgo,
            endTime: currentTime,
            limit: 7,
          },
        })
      );

      if (data.length >= 2) {
        const oldPrice = parseFloat(data[0][4]);
        const newPrice = parseFloat(data[data.length - 1][4]);
        const changePercentage = ((newPrice - oldPrice) / oldPrice) * 100;
        sevenDayChangeMap.set(coin, changePercentage);
      }
    }

    return sevenDayChangeMap;
  }

  private processCoinData(
    tickerData: any[],
    sevenDayChangeData: Map<string, number>
  ): CoinOverview[] {
    return tickerData.map((ticker) => {
      const symbol = ticker.symbol.replace('USDT', '');
      return {
        symbol: symbol,
        name: this.getFullName(symbol),
        marketCap: parseFloat(ticker.volume) * parseFloat(ticker.lastPrice),
        price: parseFloat(ticker.lastPrice),
        volume24h: parseFloat(ticker.volume),
        priceChange24h: parseFloat(ticker.priceChange),
        priceChangePercentage24h: parseFloat(ticker.priceChangePercent),
        priceChangePercentage7d: sevenDayChangeData.get(symbol) || 0,
      };
    });
  }

  private filterAndDeduplicate(coinData: CoinOverview[]): CoinOverview[] {
    const uniqueCoins = new Map<string, CoinOverview>();

    for (const coin of coinData) {
      if (
        !uniqueCoins.has(coin.symbol) ||
        coin.marketCap > uniqueCoins.get(coin.symbol).marketCap
      ) {
        uniqueCoins.set(coin.symbol, coin);
      }
    }

    return Array.from(uniqueCoins.values());
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
      BCH: 'Bitcoin cash',
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
