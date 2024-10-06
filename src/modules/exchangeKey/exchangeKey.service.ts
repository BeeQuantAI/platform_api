import { IResult } from './../../common/dto/result.type';
import { ExchangeKeyType } from './dto/exchangeKey.type';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeKey } from './models/exchangeKey.entity';
import * as ccxt from 'ccxt';
import { CreateExchangeKeyInput } from './dto/new-exchangeKey.input';
import {
  EXCHANGE_KET_INVALID,
  EXCHANGE_KEY_DELETE_FAILED,
  EXCHANGE_KEY_EXIST,
  EXCHANGE_KEY_NOT_FOUND,
  EXCHANGE_KEY_STORE_ERROR,
  EXCHANGE_NOT_EXIST,
  FAIL_TO_CREATE_EXCHANGE,
  SUCCESS,
  UNKNOWN_ERROR,
} from '@/common/constants/code';
import { Result } from '@/common/dto/result.type';
import { UserExchangeService } from '../user-exchange/user-exchange.service';
import { ExchangeService } from '../exchange/exchange.service';
import { UpdateExchangeKeyInput } from './dto/update-exchangeKey.input';
import { UserExchange } from '../user-exchange/models/user-exchange.entity';

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
    const queryRunner = this.ExchangeKeyRepository.manager.connection.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const { exchangeName, accessKey, secretKey } = input;

      const existedExchangeKey = await queryRunner.manager.findOne(ExchangeKey, {
        where: { accessKey },
      });
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

      let exchange = await this.ExchangeRepository.findByName(exchangeName);
      if (!exchange) {
        const newExchangeResult = await this.ExchangeRepository.createNewExchange(exchangeName);
        if (newExchangeResult.code !== SUCCESS) {
          await queryRunner.rollbackTransaction();
          return {
            code: FAIL_TO_CREATE_EXCHANGE,
            message: 'Failed to create new exchange',
          };
        }
        exchange = newExchangeResult.data;
      }

      const newExchangeKey = queryRunner.manager.create(ExchangeKey, {
        displayName: input.displayName,
        accessKey,
        secretKey,
        remarks: input.remarks,
      });
      const savedExchangeKey = await queryRunner.manager.save(newExchangeKey);

      if (savedExchangeKey) {
        const userExchange = queryRunner.manager.create(UserExchange, {
          user: { id: userId },
          exchange: exchange,
          exchangeKey: savedExchangeKey,
        });
        await queryRunner.manager.save(userExchange);

        await queryRunner.commitTransaction();
        return {
          code: SUCCESS,
          message: 'Exchange key created successfully',
        };
      }
      await queryRunner.rollbackTransaction();
      return {
        code: EXCHANGE_KEY_STORE_ERROR,
        message: 'Exchange key store failed',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return {
        code: UNKNOWN_ERROR,
        message: `Error creating exchange key: ${error.message}`,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async updateExchangeKey(input: UpdateExchangeKeyInput): Promise<Result> {
    const { id, exchangeName, accessKey, secretKey, displayName } = input;
    const exitedExchangeKey = await this.ExchangeKeyRepository.findOneBy({ id });

    if (!exitedExchangeKey) {
      return {
        code: EXCHANGE_KEY_NOT_FOUND,
        message: 'Exchange key not found',
      };
    }

    const verifyResult = await this.verifyExchangeKey(exchangeName, accessKey, secretKey);

    if (!verifyResult) {
      return {
        code: EXCHANGE_KET_INVALID,
        message: 'Exchange key is invalid',
      };
    }

    const newExchangeKey = { ...exitedExchangeKey, accessKey, secretKey, displayName };

    try {
      await this.ExchangeKeyRepository.save(newExchangeKey);
      return {
        code: SUCCESS,
        message: 'Exchange key updated successfully',
      };
    } catch (e) {
      return {
        code: EXCHANGE_KEY_STORE_ERROR,
        message: 'Exchange key update failed',
      };
    }
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
    try {
      let existExchangeId: null | string = null;

      const existExchanges = await this.UserExchangeRepository.findUserExchange(userId);

      for (const exchange of existExchanges) {
        if (exchange.name === exchangeName) {
          existExchangeId = exchange.id;
          break;
        }
      }

      if (existExchangeId) {
        await this.UserExchangeRepository.establishRelations(
          userId,
          exchangeKeyId,
          existExchangeId
        );
        return;
      }

      const newExchange = await this.ExchangeRepository.createNewExchange(exchangeName);

      if (newExchange.data) {
        await this.UserExchangeRepository.establishRelations(
          userId,
          exchangeKeyId,
          newExchange.data.id
        );
      } else {
        return {
          code: FAIL_TO_CREATE_EXCHANGE,
          message: 'Failed to create new exchange',
        };
      }
    } catch (error) {
      return {
        code: UNKNOWN_ERROR,
        message: `Error establishing exchange relation: ${error.message}`,
      };
    }
  }

  async deleteExchangeKey(userId: string, exchangeKeyId: string): Promise<Result> {
    const userExchange = await this.UserExchangeRepository.findOneByUserAndExchangeKey(
      userId,
      exchangeKeyId
    );

    if (!userExchange) {
      return {
        code: EXCHANGE_NOT_EXIST,
        message: 'Exchange key not found or does not belong to the user',
      };
    }

    const result = await this.ExchangeKeyRepository.delete({ id: exchangeKeyId });

    if (result.affected === 0) {
      return {
        code: EXCHANGE_KEY_DELETE_FAILED,
        message: 'Failed to delete exchange key',
      };
    }

    return {
      code: SUCCESS,
      message: 'Exchange key deleted successfully',
    };
  }

  async findExchangeKeyById(id: string): Promise<IResult<ExchangeKeyType>> {
    const exchangeKey = await this.ExchangeKeyRepository.findOneBy({ id });
    const exchange = await this.UserExchangeRepository.findUserExchangeNameByExchangeId(id);
    const res = { ...exchangeKey, exchangeName: exchange };
    if (!exchangeKey) {
      return {
        code: EXCHANGE_KEY_NOT_FOUND,
        message: 'Exchange key not found',
      };
    }
    return {
      code: SUCCESS,
      message: 'Exchange key found',
      data: res,
    };
  }
}
