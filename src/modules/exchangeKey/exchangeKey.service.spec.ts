import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ExchangeKeyService } from './exchangeKey.service';
import { ExchangeKey } from './models/exchangeKey.entity';
import {
  EXCHANGE_KEY_EXIST,
  EXCHANGE_NOT_EXIST,
  EXCHANGE_KET_INVALID,
  SUCCESS,
  EXCHANGE_KEY_NOT_FOUND,
  EXCHANGE_KEY_DELETE_FAILED,
} from '@/common/constants/code';
import { UserExchangeService } from '../user-exchange/user-exchange.service';
import { ExchangeService } from '../exchange/exchange.service';
import * as ccxt from 'ccxt';
import { UserExchange } from '../user-exchange/models/user-exchange.entity';

describe('ExchangeKeyService', () => {
  let exchangeKeyService: ExchangeKeyService;
  let exchangeKeyRepo: Repository<ExchangeKey>;
  let userExchangeService: UserExchangeService;

  const mockExistExchangeKey = {
    accessKey: '123',
    secretKey: '456',
  } as ExchangeKey;
  const validExchangeKey = {
    id: 'uuid123',
    displayName: 'Binance Core',
    exchangeName: 'binance',
    accessKey: 'accesskey',
    secretKey: 'secretkey',
  };
  const mockUserExchange = {
    id: 'exchangeKeyId',
    user: { id: 'userId' },
    exchangeKey: { id: 'exchangeKeyId' },
    exchange: { id: 'exchangeId' },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserExchange;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeKeyService,
        {
          provide: getRepositoryToken(ExchangeKey),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UserExchangeService,
          useValue: {
            findUserExchangeNameByExchangeId: jest.fn().mockResolvedValue('binance'),
            findOneByUserAndExchangeKey: jest.fn(),
          },
        },
        { provide: ExchangeService, useValue: {} },
      ],
    }).compile();

    exchangeKeyService = module.get(ExchangeKeyService);
    exchangeKeyRepo = module.get(getRepositoryToken(ExchangeKey));
    userExchangeService = module.get(UserExchangeService);
  });

  it('should be defined', () => {
    expect(exchangeKeyService).toBeDefined();
  });

  it('return exchange key already exists, if the exchange key has already stored', async () => {
    const testExchangeKey = {
      ...validExchangeKey,
      accessKey: '123',
      secretKey: '456',
    };
    exchangeKeyRepo.findOneBy = jest.fn().mockResolvedValue(mockExistExchangeKey);
    const result = await exchangeKeyService.createNewExchangeKey('uuid123', testExchangeKey);
    expect(result).toEqual({
      code: EXCHANGE_KEY_EXIST,
      message: 'Exchange key already exists',
    });
  });

  it('return exchange is not supported, if the exchange is not included', async () => {
    const testExchangeKey = {
      ...validExchangeKey,
      exchangeName: 'bin',
    };
    const result = await exchangeKeyService.createNewExchangeKey('uuid123', testExchangeKey);
    expect(result).toEqual({
      code: EXCHANGE_NOT_EXIST,
      message: 'Current exchange is not supported',
    });
  });

  it('return exchange key is invalid, if the exchange key is invalid', async () => {
    console.error = jest.fn();
    const testExchangeKey = {
      ...validExchangeKey,
      accessKey: '123',
    };
    const result = await exchangeKeyService.createNewExchangeKey('uuid123', testExchangeKey);
    expect(result).toEqual({
      code: EXCHANGE_KET_INVALID,
      message: 'Exchange key is invalid',
    });
  });

  it('should return true if key verification is successful', async () => {
    const { exchangeName, accessKey, secretKey } = validExchangeKey;
    jest.spyOn(ccxt, 'binance').mockImplementation(
      () =>
        ({
          fetchBalance: jest.fn().mockResolvedValue({ total: { BTC: 1.234, ETH: 5.678 } }),
        }) as any
    );
    const result = await exchangeKeyService.verifyExchangeKey(exchangeName, accessKey, secretKey);
    expect(result).toBe(true);
  });

  it('should create a new exchange key', async () => {
    exchangeKeyService.establishUserExchangeRelation = jest.fn();
    exchangeKeyService.verifyExchangeKey = jest.fn().mockResolvedValue(true);
    exchangeKeyRepo.create = jest.fn().mockReturnValue(validExchangeKey);
    exchangeKeyRepo.save = jest.fn().mockResolvedValue(validExchangeKey);
    const result = await exchangeKeyService.createNewExchangeKey('uuid123', validExchangeKey);
    expect(result).toEqual({
      code: SUCCESS,
      message: 'Exchange key created successfully',
    });
  });

  it('should return exchange key not found, if the exchange key is not found', async () => {
    exchangeKeyRepo.findOneBy = jest.fn().mockResolvedValue(null);
    const result = await exchangeKeyService.findExchangeKeyById('uuid222');
    expect(result).toEqual({
      code: EXCHANGE_KEY_NOT_FOUND,
      message: 'Exchange key not found',
    });
  });

  it('should return the exchange key, if the exchange key is found', async () => {
    exchangeKeyRepo.findOneBy = jest.fn().mockResolvedValue(validExchangeKey);
    const result = await exchangeKeyService.findExchangeKeyById(validExchangeKey.id);
    expect(result).toEqual({
      code: SUCCESS,
      message: 'Exchange key found',
      data: validExchangeKey,
    });
  });

  it('should update the exchange key', async () => {
    const updateExchangeKey = { ...validExchangeKey, accessKey: 'newAccess' };
    exchangeKeyRepo.findOneBy = jest.fn().mockResolvedValue(validExchangeKey);
    exchangeKeyService.verifyExchangeKey = jest.fn().mockResolvedValue(true);

    exchangeKeyRepo.save = jest.fn().mockResolvedValue(updateExchangeKey);
    const result = await exchangeKeyService.updateExchangeKey(updateExchangeKey);
    expect(result).toEqual({
      code: SUCCESS,
      message: 'Exchange key updated successfully',
    });
  });

  it('should return EXCHANGE_NOT_EXIST if user exchange not found', async () => {
    jest.spyOn(userExchangeService, 'findOneByUserAndExchangeKey').mockResolvedValue(null);
    const result = await exchangeKeyService.deleteExchangeKey('userId', 'exchangeKeyId');
    expect(result).toEqual({
      code: EXCHANGE_NOT_EXIST,
      message: 'Exchange key not found or does not belong to the user',
    });
  });

  it('should return EXCHANGE_KEY_DELETE_FAILED if delete operation fails', async () => {
    jest
      .spyOn(userExchangeService, 'findOneByUserAndExchangeKey')
      .mockResolvedValue(mockUserExchange);
    const mockDeleteResult: DeleteResult = { affected: 0 } as DeleteResult;
    exchangeKeyRepo.delete = jest.fn().mockResolvedValue(mockDeleteResult);
    const result = await exchangeKeyService.deleteExchangeKey('userId', 'exchangeKeyId');
    expect(result).toEqual({
      code: EXCHANGE_KEY_DELETE_FAILED,
      message: 'Failed to delete exchange key',
    });
  });

  it('should return SUCCESS if delete operation succeeds', async () => {
    jest
      .spyOn(userExchangeService, 'findOneByUserAndExchangeKey')
      .mockResolvedValue(mockUserExchange);
    const mockDeleteResult: DeleteResult = { affected: 1 } as DeleteResult;
    exchangeKeyRepo.delete = jest.fn().mockResolvedValue(mockDeleteResult);
    const result = await exchangeKeyService.deleteExchangeKey('userId', 'exchangeKeyId');
    expect(result).toEqual({
      code: SUCCESS,
      message: 'Exchange key deleted successfully',
    });
  });
});
