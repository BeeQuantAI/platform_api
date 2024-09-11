import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeKeyService } from './exchangeKey.service';
import { ExchangeKey } from './models/exchangeKey.entity';
import {
  EXCHANGE_KEY_EXIST,
  EXCHANGE_NOT_EXIST,
  EXCHANGE_KET_INVALID,
  SUCCESS,
} from '@/common/constants/code';
import { UserExchangeService } from '../user-exchange/user-exchange.service';
import { ExchangeService } from '../exchange/exchange.service';
import * as ccxt from 'ccxt';

describe('ExchangeKeyService', () => {
  let exchangeKeyService: ExchangeKeyService;
  let exchangeKeyRepo: Repository<ExchangeKey>;

  const mockExistExchangeKey = {
    accessKey: '123',
    secretKey: '456',
  } as ExchangeKey;
  const validExchangeKey = {
    displayName: 'Binance Core',
    exchangeName: 'binance',
    accessKey: 'accesskey',
    secretKey: 'secretkey',
  };

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
          },
        },
        { provide: UserExchangeService, useValue: {} },
        { provide: ExchangeService, useValue: {} },
      ],
    }).compile();

    exchangeKeyService = module.get(ExchangeKeyService);
    exchangeKeyRepo = module.get(getRepositoryToken(ExchangeKey));
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
});
