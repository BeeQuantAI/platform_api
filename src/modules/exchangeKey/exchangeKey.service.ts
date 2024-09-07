import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeKey } from './models/exchangeKey.entity';
import * as ccxt from 'ccxt';
import { CreateExchangeKeyInput } from './dto/new-exchangeKey.input';
import {
  EXCHANGE_KET_INVALID,
  EXCHANGE_KEY_EXIST,
  EXCHANGE_KEY_STORE_ERROR,
  EXCHANGE_NOT_EXIST,
  SUCCESS,
} from '@/common/constants/code';
import { Result } from '@/common/dto/result.type';
import { UserExchangeService } from '../user-exchange/user-exchange.service';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class ExchangeKeyService {
  supportedExchanges = ['binance'];

  constructor(
    @InjectRepository(ExchangeKey)
    private ExchangeKeyRepository: Repository<ExchangeKey>,
    private UserExchangeRepository: UserExchangeService,
    private ExchangeRepository: ExchangeService
  ) {}

  async createNewExchangeKey(userId: string, input: CreateExchangeKeyInput): Promise<Result> {
    const { exchangeName, accessKey, secretKey } = input;

    const existedExchangeKey = await this.ExchangeKeyRepository.findOneBy({ accessKey });
    if (existedExchangeKey) {
      return {
        code: EXCHANGE_KEY_EXIST,
        message: 'Exchange key already exists',
      };
    }

    if (!this.supportedExchanges.includes(exchangeName)) {
      return {
        code: EXCHANGE_NOT_EXIST,
        message: 'Current exchange is not supported',
      };
    }

    const verifyResult = await this.verifyExchangeKey(exchangeName, accessKey, secretKey);
    if (!verifyResult) {
      return {
        code: EXCHANGE_KET_INVALID,
        message: 'Exchange key is invalid',
      };
    }

    const newExchangeKey = this.ExchangeKeyRepository.create(input);
    const result = await this.ExchangeKeyRepository.save(newExchangeKey);
    if (result) {
      this.establishUserExchangeRelation(userId, result.id, exchangeName);
      return {
        code: SUCCESS,
        message: 'Exchange key created successfully',
      };
    }
    return {
      code: EXCHANGE_KEY_STORE_ERROR,
      message: 'Exchange key store failed',
    };
  }

  async verifyExchangeKey(
    exchangeName: string,
    accessKey: string,
    secretKey: string
  ): Promise<boolean> {
    try {
      const exchangeClass = ccxt[exchangeName];
      const exchange = new exchangeClass({
        apiKey: accessKey,
        secret: secretKey,
      });
      await exchange.fetchBalance();
      return true;
    } catch (error) {
      console.error(`Error verifying key for exchange ${exchangeName}:`, error);
      return false;
    }
  }

  async establishUserExchangeRelation(userId: string, exchangeKeyId: string, exchangeName: string) {
    let existExchangeId: null | string = null;
    const existExchanges = await this.UserExchangeRepository.findUserExchange(userId);
    existExchanges.forEach((exchange) => {
      if (exchange.name === exchangeName) {
        existExchangeId = exchange.id;
      }
    });

    if (existExchangeId) {
      await this.UserExchangeRepository.establishRelations(userId, exchangeKeyId, existExchangeId);
      return;
    }

    const newExchange = await this.ExchangeRepository.createNewExchange(exchangeName);
    await this.UserExchangeRepository.establishRelations(userId, exchangeKeyId, newExchange.id);
  }
}
