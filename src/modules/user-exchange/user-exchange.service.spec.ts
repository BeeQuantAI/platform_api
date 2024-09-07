import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserExchangeService } from './user-exchange.service';
import { UserExchange } from './models/user-exchange.entity';

describe('ExchangeService', () => {
  let service: UserExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserExchangeService,
        {
          provide: getRepositoryToken(UserExchange),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UserExchangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should establish relations between user and exchange', async () => {
    const userExchange = {
      id: '123',
      user: { id: '234' },
      exchangeKey: { id: '345' },
    } as UserExchange;
    jest.spyOn(service, 'establishRelations').mockResolvedValueOnce(userExchange);
    const result = await service.establishRelations('234', '345', '456');
    expect(result).toBe(userExchange);
  });

  it('should find user exchange by user id', async () => {
    const userExchange = {
      name: 'binance',
      id: '123',
    };
    jest.spyOn(service, 'findUserExchange').mockResolvedValueOnce([userExchange]);
    const result = await service.findUserExchange('123');
    expect(result).toHaveLength(1);
    expect(result).toContain(userExchange);
  });
});
