import { Test, TestingModule } from '@nestjs/testing';
import { BinanceDataService } from './binance-data.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('BinanceDataService', () => {
  let binanceDataService: BinanceDataService;
  let httpService: HttpService;

  const mockReturnData = [
    [
      1696041600000,
      '59993.02000000',
      '59995.59000000',
      '59993.02000000',
      '59995.59000000',
      '6.03406000',
      1696128000000,
      '362006.63261060',
      453,
      '4.25837000',
      '255475.71115570',
    ],
  ];

  const validQuery = {
    symbol: 'BTCUSDT',
    interval: '1m',
    startTime: '2024-09-15T00:00:00.000Z',
    endTime: '2024-09-30T00:00:00.000Z',
    limit: 1,
    timeZone: 'UTC',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BinanceDataService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    binanceDataService = module.get<BinanceDataService>(BinanceDataService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(binanceDataService).toBeDefined();
  });

  it('should return data if fetch data success', async () => {
    const expectResult = [
      {
        openTime: new Date(1696041600000),
        openPrice: '59993.02000000',
        highPrice: '59995.59000000',
        lowPrice: '59993.02000000',
        closePrice: '59995.59000000',
        volume: '6.03406000',
        closeTime: new Date(1696128000000),
        quoteAssetVolume: '362006.63261060',
        numberOfTrades: 453,
        takerBuyBaseAssetVolume: '4.25837000',
        takerBuyQuoteAssetVolume: '255475.71115570',
      },
    ];
    jest.spyOn(httpService, 'get').mockReturnValue(of({ data: mockReturnData }) as any);
    const result = await binanceDataService.getUiKlinesData(validQuery);
    expect(result.data).toEqual(expectResult);
  });
});
