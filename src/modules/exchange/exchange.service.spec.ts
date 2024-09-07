import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeService } from './exchange.service';
import { Exchange } from './models/exchange.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ExchangeService', () => {
  let service: ExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        {
          provide: getRepositoryToken(Exchange),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ExchangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new exchange', async () => {
    const exchange = { id: '123', name: 'binance', userExchange: [] } as Exchange;
    jest.spyOn(service, 'createNewExchange').mockResolvedValueOnce(exchange);
    const result = await service.createNewExchange('binance');
    expect(result).toBe(exchange);
  });

  it('should find an exchange by id', async () => {
    const testExchange = { id: '111', name: 'binance', userExchange: [] } as Exchange;
    jest.spyOn(service, 'findExchangeById').mockResolvedValueOnce(testExchange);
    const foundExchange = await service.findExchangeById('111');
    expect(foundExchange).toBe(testExchange);
  });
});
