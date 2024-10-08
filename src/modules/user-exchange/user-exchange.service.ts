import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserExchange } from './models/user-exchange.entity';
import { Repository } from 'typeorm';
import * as ccxt from 'ccxt';
import { IResults } from '@/common/dto/result.type';
import {
  EXCHANGE_FETCHING_ERROR,
  EXCHANGE_NOT_EXIST,
  SUCCESS,
  TICKER_NOT_FOUND,
  TIMEOUT,
  UNKNOWN_ERROR,
  USER_EXCHANGE_NOT_FOUND,
} from '@/common/constants/code';
import { UserExchangeType } from './dto/userExchangeResult.type';
import { fetchWithRetry } from '@/common/utils/fetchRetry';
import { Ticker } from 'ccxt';

@Injectable()
export class UserExchangeService {
  constructor(
    @InjectRepository(UserExchange)
    private userExchangeRepository: Repository<UserExchange>
  ) {}

  async establishRelations(
    userId: string,
    exchangeKeyId: string,
    exchangeId: string
  ): Promise<UserExchange> {
    const newUserExchange = this.userExchangeRepository.create({
      user: { id: userId },
      exchangeKey: { id: exchangeKeyId },
      exchange: { id: exchangeId },
    });
    return await this.userExchangeRepository.save(newUserExchange);
  }

  async findUserExchange(userId: string): Promise<
    {
      name: string;
      id: string;
    }[]
  > {
    const res = await this.userExchangeRepository.find({
      where: { user: { id: userId } },
      relations: ['exchange'],
    });
    return res.map((exchange) => ({
      name: exchange.exchange.name,
      id: exchange.exchange.id,
    }));
  }

  async findOneByUserAndExchangeKey(
    userId: string,
    exchangeKeyId: string
  ): Promise<UserExchange | undefined> {
    return await this.userExchangeRepository.findOne({
      where: { user: { id: userId }, exchangeKey: { id: exchangeKeyId } },
      relations: ['exchangeKey'],
    });
  }

  async findUserExchangeNameByExchangeId(id: string): Promise<string> {
    const res = await this.userExchangeRepository.findOne({
      where: { exchangeKey: { id } },
      relations: ['exchange'],
    });
    return res.exchange.name;
  }

  async getUserExchangesAndBalances(userId: string): Promise<IResults<UserExchangeType>> {
    interface Balance {
      total: { [symbol: string]: number };
      free: { [symbol: string]: number };
      used: { [symbol: string]: number };
    }

    try {
      const userExchanges = await this.userExchangeRepository.find({
        where: { user: { id: userId } },
        relations: ['exchange', 'exchangeKey'],
      });

      if (userExchanges.length === 0) {
        throw { code: USER_EXCHANGE_NOT_FOUND, message: 'No exchanges found for this user' };
      }

      const exchangeResults: UserExchangeType[] = await Promise.all(
        userExchanges.map(async (userExchange) => {
          const { accessKey, secretKey, displayName, id: exchangeKeyId } = userExchange.exchangeKey;
          const exchangeName = userExchange.exchange.name;

          const ExchangeClass = ccxt[exchangeName.toLowerCase()];
          if (!ExchangeClass) {
            throw {
              code: EXCHANGE_NOT_EXIST,
              message: `Exchange ${exchangeName} is not supported.`,
            };
          }

          const exchange = new ExchangeClass({
            apiKey: accessKey,
            secret: secretKey,
          });

          try {
            const balance: Balance = await fetchWithRetry(() => exchange.fetchBalance());

            let totalUsdValue = 0;
            const symbolsToFetch: string[] = [];

            for (const symbol in balance.total) {
              if (balance.total[symbol] > 0) {
                if (symbol === 'USDT') {
                  totalUsdValue += balance.total[symbol];
                } else {
                  symbolsToFetch.push(`${symbol}/USDT`);
                }
              }
            }

            const tickers = await Promise.all(
              symbolsToFetch.map(async (pair) => {
                return (await fetchWithRetry(() => exchange.fetchTicker(pair))) as Ticker;
              })
            );

            tickers.forEach((ticker, index) => {
              if (ticker && ticker.last) {
                const symbol = symbolsToFetch[index].split('/')[0];
                totalUsdValue += balance.total[symbol] * ticker.last;
              } else {
                throw {
                  code: TICKER_NOT_FOUND,
                  message: `No valid ticker found for ${symbolsToFetch[index]}`,
                };
              }
            });

            return {
              id: exchangeKeyId,
              name: exchangeName,
              displayName,
              balances: totalUsdValue,
            } as UserExchangeType;
          } catch (error) {
            throw {
              code: EXCHANGE_FETCHING_ERROR,
              message: `Error fetching balance for ${exchangeName}: ${error.message}`,
            };
          }
        })
      );

      return {
        code: SUCCESS,
        message: 'User exchanges and balances fetched successfully',
        data: exchangeResults,
      };
    } catch (error) {
      return {
        code: error.code || UNKNOWN_ERROR,
        message: error.message || 'An unknown error occurred',
      };
    }
  }
}
