import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeKeyService } from './exchangeKey.service';
import { ExchangeKey } from './models/exchangeKey.entity';
import { UserExchangeService } from '../user-exchange/user-exchange.service';
import { ExchangeService } from '../exchange/exchange.service';
import * as ccxt from 'ccxt';

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

  const mockQueryRunner = {
    manager: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    },
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ExchangeKeyService,
        {
          provide: getRepositoryToken(ExchangeKey),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            manager: {
              connection: {
                createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
              },
            },
          },
        },
        {
          provide: UserExchangeService,
          useValue: {
            findUserExchangeNameByExchangeId: jest.fn().mockResolvedValue('binance'),
            findOneByUserAndExchangeKey: jest.fn(),
            findUserExchange: jest.fn(),
            establishRelations: jest.fn(),
          },
        },
        {
          provide: ExchangeService,
          useValue: {
            findByName: jest.fn().mockResolvedValue(null),
            createNewExchange: jest.fn().mockResolvedValue({
              code: 200,
              data: { id: 'exchange123' },
            }),
          },
        },
      ],
    }).compile();

    exchangeKeyService = module.get<ExchangeKeyService>(ExchangeKeyService);
    exchangeKeyRepo = module.get<Repository<ExchangeKey>>(getRepositoryToken(ExchangeKey));
    userExchangeService = module.get<UserExchangeService>(UserExchangeService);
    const exchangeService = module.get<ExchangeService>(ExchangeService);
  });

  it('should be defined', () => {
    expect(exchangeKeyService).toBeDefined();
  });

  it('should return exchange key already exists, if the exchange key has already been stored', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue(mockExistExchangeKey);
    const result = await exchangeKeyService.createNewExchangeKey('uuid123', {
      ...validExchangeKey,
      accessKey: '123',
      secretKey: '456',
    });
    expect(result).toEqual({
      code: 10012,
      message: 'Exchange key already exists',
    });
  });

  it('should create a new exchange key', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue(null);
    exchangeKeyService.verifyExchangeKey = jest.fn().mockResolvedValue(true);
    mockQueryRunner.manager.create.mockReturnValue(validExchangeKey);
    mockQueryRunner.manager.save.mockResolvedValue(validExchangeKey);

    const result = await exchangeKeyService.createNewExchangeKey('uuid123', validExchangeKey);

    expect(result).toEqual({
      code: 200,
      message: 'Exchange key created successfully',
    });
  });

  it('should create a new exchange if it does not exist', async () => {
    const exchangeService = module.get<ExchangeService>(ExchangeService);
    exchangeService.findByName = jest.fn().mockResolvedValue(null);

    exchangeService.createNewExchange = jest.fn().mockResolvedValue({
      code: 200,
      data: { id: 'newExchangeId' },
    });

    mockQueryRunner.manager.findOne.mockResolvedValue(null);
    exchangeKeyService.verifyExchangeKey = jest.fn().mockResolvedValue(true);
    mockQueryRunner.manager.create.mockReturnValue(validExchangeKey);
    mockQueryRunner.manager.save.mockResolvedValue(validExchangeKey);

    const result = await exchangeKeyService.createNewExchangeKey('uuid123', validExchangeKey);

    expect(result).toEqual({
      code: 200,
      message: 'Exchange key created successfully',
    });
  });

  it('should return exchange is not supported if the exchange is not included', async () => {
    const testExchangeKey = {
      ...validExchangeKey,
      exchangeName: 'unsupportedExchange',
    };
    const result = await exchangeKeyService.createNewExchangeKey('uuid123', testExchangeKey);
    expect(result).toEqual({
      code: 10013,
      message: 'Current exchange is not supported',
    });
  });

  it('should return exchange key is invalid if the key verification fails', async () => {
    exchangeKeyService.verifyExchangeKey = jest.fn().mockResolvedValue(false);

    const result = await exchangeKeyService.createNewExchangeKey('uuid123', validExchangeKey);

    expect(result).toEqual({
      code: 10014,
      message: 'Exchange key is invalid',
    });
  });
});
