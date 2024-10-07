import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  CoinOverview,
  RawCoinDetailsFromCoingecko,
  RawCoinDetailsFromBinance,
  MarketOverviewResponse,
  CoinOverviewResponse,
  CoinDetailsResponse,
} from './dto/market-overview.types';
import { firstValueFrom } from 'rxjs';
import {
  SUCCESS,
  MARKET_OVERVIEW_NO_DATA,
  MARKET_OVERVIEW_INVALID_SYMBOL,
  MARKET_OVERVIEW_FETCH_ERROR,
  API_FETCH_LIMIT_REACHED,
} from '@/common/constants/code';

@Injectable()
export class MarketOverviewService {
  private readonly BINANCE_BASE_URL = 'https://api.binance.com/api/v3';
  private readonly COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

  private readonly COIN_LIST = [
    { symbol: 'BTC', fullName: 'Bitcoin', coingeckoId: 'bitcoin' },
    { symbol: 'ETH', fullName: 'Ethereum', coingeckoId: 'ethereum' },
    { symbol: 'BNB', fullName: 'BNB', coingeckoId: 'binancecoin' },
    { symbol: 'SOL', fullName: 'Solana', coingeckoId: 'solana' },
    { symbol: 'USDC', fullName: 'USD Coin', coingeckoId: 'usd-coin' },
    { symbol: 'XRP', fullName: 'XRP', coingeckoId: 'xrp' },
    { symbol: 'DOGE', fullName: 'Dogecoin', coingeckoId: 'dogecoin' },
    { symbol: 'TON', fullName: 'Toncoin', coingeckoId: 'the-open-network' },
    { symbol: 'ADA', fullName: 'Cardano', coingeckoId: 'cardano' },
    { symbol: 'SHIB', fullName: 'Shiba Inu', coingeckoId: 'shiba-inu' },
    { symbol: 'AVAX', fullName: 'Avalanche', coingeckoId: 'avalanche-2' },
    { symbol: 'TRX', fullName: 'Tron', coingeckoId: 'tron' },
    { symbol: 'DOT', fullName: 'Polkadot', coingeckoId: 'polkadot' },
    { symbol: 'BCH', fullName: 'Bitcoin cash', coingeckoId: 'bitcoin-cash' },
    { symbol: 'LINK', fullName: 'Chainlink', coingeckoId: 'chainlink' },
    { symbol: 'NEAR', fullName: 'NEAR Protocol', coingeckoId: 'near' },
    { symbol: 'MATIC', fullName: 'Polygon', coingeckoId: 'matic-network' },
    { symbol: 'ICP', fullName: 'Internet Computer', coingeckoId: 'internet-computer' },
    { symbol: 'LTC', fullName: 'Litecoin', coingeckoId: 'litecoin' },
    { symbol: 'DAI', fullName: 'Dai', coingeckoId: 'dai' },
  ];

  private readonly STABLE_COINS = ['USDC', 'DAI'];

  constructor(private httpService: HttpService) {}

  async getMarketOverview(): Promise<MarketOverviewResponse> {
    try {
      const combinedData = await this.getCombinedData();
      const sevenDayChangeData = await this.fetchSevenDayChangeData();
      const coinData = this.processCoinData(combinedData, sevenDayChangeData);
      const validCoinData = this.filterAndDeduplicate(coinData);

      if (validCoinData.length === 0) {
        return {
          code: MARKET_OVERVIEW_NO_DATA,
          message: 'No valid coin data available',
        };
      }

      const nonStableCoins = validCoinData.filter(
        (coin) => !this.STABLE_COINS.includes(coin.symbol)
      );

      return {
        code: SUCCESS,
        message: 'Market overview retrieved successfully',
        data: {
          topMarketCap: this.getTopByAttribute(validCoinData, 'marketCap', 5),
          topClimbers: this.getTopByAttribute(nonStableCoins, 'priceChangePercentage24h', 5),
          topFallers: this.getTopByAttribute(nonStableCoins, 'priceChangePercentage24h', 5, true),
          top20Cryptocurrencies: this.getTopByAttribute(validCoinData, 'marketCap', 20),
        },
      };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return {
          code: API_FETCH_LIMIT_REACHED,
          message: 'API fetch limit reached',
        };
      }
      return {
        code: MARKET_OVERVIEW_FETCH_ERROR,
        message: 'Error fetching market overview data',
      };
    }
  }

  // Deprecated: Please use getMarketOverview instead
  async getTopMarketCap(): Promise<CoinOverviewResponse> {
    try {
      const combinedData = await this.getCombinedData();
      const coinData = this.processCoinData(combinedData, new Map());
      const validCoinData = this.filterAndDeduplicate(coinData);

      if (validCoinData.length === 0) {
        return {
          code: MARKET_OVERVIEW_NO_DATA,
          message: 'No valid coin data available',
        };
      }

      return {
        code: SUCCESS,
        message: 'Top market cap coins retrieved successfully',
        data: this.getTopByAttribute(validCoinData, 'marketCap', 5),
      };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return {
          code: API_FETCH_LIMIT_REACHED,
          message: 'API fetch limit reached',
        };
      }
      return {
        code: MARKET_OVERVIEW_FETCH_ERROR,
        message: 'Error fetching top market cap data',
      };
    }
  }

  // Deprecated: Please use getMarketOverview instead
  async getTopClimbers(): Promise<CoinOverviewResponse> {
    try {
      const combinedData = await this.getCombinedData();
      const coinData = this.processCoinData(combinedData, new Map());
      const validCoinData = this.filterAndDeduplicate(coinData);

      if (validCoinData.length === 0) {
        return {
          code: MARKET_OVERVIEW_NO_DATA,
          message: 'No valid coin data available',
        };
      }

      const nonStableCoins = validCoinData.filter(
        (coin) => !this.STABLE_COINS.includes(coin.symbol)
      );
      return {
        code: SUCCESS,
        message: 'Top climbers retrieved successfully',
        data: this.getTopByAttribute(nonStableCoins, 'priceChangePercentage24h', 5),
      };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return {
          code: API_FETCH_LIMIT_REACHED,
          message: 'API fetch limit reached',
        };
      }
      return {
        code: MARKET_OVERVIEW_FETCH_ERROR,
        message: 'Error fetching top climbers data',
      };
    }
  }

  // Deprecated: Please use getMarketOverview instead
  async getTopFallers(): Promise<CoinOverviewResponse> {
    try {
      const combinedData = await this.getCombinedData();
      const coinData = this.processCoinData(combinedData, new Map());
      const validCoinData = this.filterAndDeduplicate(coinData);

      if (validCoinData.length === 0) {
        return {
          code: MARKET_OVERVIEW_NO_DATA,
          message: 'No valid coin data available',
        };
      }

      const nonStableCoins = validCoinData.filter(
        (coin) => !this.STABLE_COINS.includes(coin.symbol)
      );
      return {
        code: SUCCESS,
        message: 'Top fallers retrieved successfully',
        data: this.getTopByAttribute(nonStableCoins, 'priceChangePercentage24h', 5, true),
      };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return {
          code: API_FETCH_LIMIT_REACHED,
          message: 'API fetch limit reached',
        };
      }
      return {
        code: MARKET_OVERVIEW_FETCH_ERROR,
        message: 'Error fetching top fallers data',
      };
    }
  }

  // Deprecated: Please use getMarketOverview instead
  async getTop20Cryptocurrencies(): Promise<CoinOverviewResponse> {
    try {
      const combinedData = await this.getCombinedData();
      const sevenDayChangeData = await this.fetchSevenDayChangeData();
      const coinData = this.processCoinData(combinedData, sevenDayChangeData);
      const validCoinData = this.filterAndDeduplicate(coinData);

      if (validCoinData.length === 0) {
        return {
          code: MARKET_OVERVIEW_NO_DATA,
          message: 'No valid coin data available',
        };
      }

      return {
        code: SUCCESS,
        message: 'Top 20 cryptocurrencies retrieved successfully',
        data: this.getTopByAttribute(validCoinData, 'marketCap', 20),
      };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return {
          code: API_FETCH_LIMIT_REACHED,
          message: 'API fetch limit reached',
        };
      }
      return {
        code: MARKET_OVERVIEW_FETCH_ERROR,
        message: 'Error fetching top 20 cryptocurrencies data',
      };
    }
  }

  async getCoinDetails(symbol: string): Promise<CoinDetailsResponse> {
    try {
      const ids = this.getCoingeckoId(symbol);
      if (!ids) {
        return {
          code: MARKET_OVERVIEW_INVALID_SYMBOL,
          message: `Invalid symbol: ${symbol}`,
        };
      }

      const binanceSymbol = symbol === 'DAI' ? 'USDTDAI' : `${symbol}USDT`;

      const [{ data: binanceData }, { data: coingeckoData }] = await Promise.all([
        firstValueFrom(
          this.httpService.get(`${this.BINANCE_BASE_URL}/ticker/24hr`, {
            params: { symbol: binanceSymbol },
          })
        ),
        firstValueFrom(
          this.httpService.get(`${this.COINGECKO_BASE_URL}/coins/markets`, {
            params: {
              vs_currency: 'usd',
              ids: ids,
            },
          })
        ),
      ]);

      if (!binanceData || !coingeckoData || coingeckoData.length === 0) {
        return {
          code: MARKET_OVERVIEW_NO_DATA,
          message: `No data available for symbol: ${symbol}`,
        };
      }

      return {
        code: SUCCESS,
        message: 'Coin details retrieved successfully',
        data: {
          symbol,
          name: this.getFullName(symbol),
          price: parseFloat(binanceData.lastPrice),
          volume24h: parseFloat(binanceData.volume),
          quoteVolume24h: parseFloat(binanceData.quoteVolume),
          priceChange24h: parseFloat(binanceData.priceChange),
          priceChangePercentage24h: parseFloat(binanceData.priceChangePercent),
          low24h: parseFloat(binanceData.lowPrice),
          high24h: parseFloat(binanceData.highPrice),
          ath: coingeckoData[0].ath,
          circulationSupply: coingeckoData[0].circulating_supply,
          totalSupply: coingeckoData[0].total_supply,
          maxSupply: coingeckoData[0].max_supply,
        },
      };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return {
          code: API_FETCH_LIMIT_REACHED,
          message: `API fetch limit reached when fetching coin details for symbol: ${symbol}`,
        };
      }
      return {
        code: MARKET_OVERVIEW_FETCH_ERROR,
        message: `Error fetching coin details for symbol: ${symbol}`,
      };
    }
  }

  private async fetchTickerData(): Promise<RawCoinDetailsFromBinance[]> {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${this.BINANCE_BASE_URL}/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","USDCUSDT","XRPUSDT","DOGEUSDT","TONUSDT","ADAUSDT","SHIBUSDT","AVAXUSDT","TRXUSDT","DOTUSDT","BCHUSDT","LINKUSDT","NEARUSDT","MATICUSDT","ICPUSDT","LTCUSDT","USDTDAI"]`
      )
    );
    const parsedData = data
      .map((coin) => ({
        ...coin,
        symbol: coin.symbol.replace('USDT', ''),
      }))
      .map((coin) => ({
        symbol: coin.symbol,
        priceChange: coin.priceChange,
        lastPrice: coin.lastPrice,
        volume: coin.volume,
        priceChangePercent: coin.priceChangePercent,
      }));
    return parsedData;
  }

  private async fetchMarketDataFromCoingecko(): Promise<RawCoinDetailsFromCoingecko[]> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
        },
      })
    );
    const parsedData = data
      .filter((coin) =>
        this.COIN_LIST.some((coinList) => coinList.symbol === coin.symbol.toUpperCase())
      )
      .map((coin) => ({
        symbol: coin.symbol.toUpperCase(),
        marketCap: coin.market_cap,
      }));
    return parsedData;
  }

  private async getCombinedData(): Promise<
    Partial<RawCoinDetailsFromBinance & RawCoinDetailsFromCoingecko>[]
  > {
    const binanceData = await this.fetchTickerData();
    const coingeckoData = await this.fetchMarketDataFromCoingecko();
    return this.combinedData(binanceData, coingeckoData);
  }

  private async fetchSevenDayChangeData(): Promise<Map<string, number>> {
    const sevenDayChangeMap = new Map<string, number>();
    const currentTime = Date.now();
    const sevenDaysAgo = currentTime - 7 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < this.COIN_LIST.length; i++) {
      const coin = this.COIN_LIST[i].symbol;
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.BINANCE_BASE_URL}/klines`, {
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
        const oldPrice = parseFloat(data[0][1]);
        const newPrice = parseFloat(data[data.length - 1][4]);
        const changePercentage = ((newPrice - oldPrice) / oldPrice) * 100;
        sevenDayChangeMap.set(coin, changePercentage);
      }
    }
    return sevenDayChangeMap;
  }

  private processCoinData(
    tickerData: Partial<RawCoinDetailsFromBinance & RawCoinDetailsFromCoingecko>[],
    sevenDayChangeData: Map<string, number>
  ): CoinOverview[] {
    return tickerData.map((ticker) => {
      return {
        symbol: ticker.symbol,
        name: this.getFullName(ticker.symbol),
        marketCap: ticker.marketCap,
        price: parseFloat(ticker.lastPrice),
        volume24h: parseFloat(ticker.volume),
        priceChange24h: parseFloat(ticker.priceChange),
        priceChangePercentage24h: parseFloat(ticker.priceChangePercent),
        priceChangePercentage7d: sevenDayChangeData.get(ticker.symbol) || 0,
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
    const res = this.COIN_LIST.find((coin) => coin.symbol === symbol).fullName;
    return res;
  }

  private getCoingeckoId(symbol: string): string {
    const res = this.COIN_LIST.find((coin) => coin.symbol === symbol).coingeckoId;
    return res;
  }

  private combinedData(
    binanceData: RawCoinDetailsFromBinance[],
    coingeckoData: RawCoinDetailsFromCoingecko[]
  ): Partial<RawCoinDetailsFromBinance & RawCoinDetailsFromCoingecko>[] {
    const combinedData = binanceData.map((binanceCoin) => {
      const coingeckoCoin = coingeckoData.find((coin) => coin.symbol === binanceCoin.symbol);
      return {
        ...binanceCoin,
        ...coingeckoCoin,
      };
    });
    return combinedData;
  }
}
