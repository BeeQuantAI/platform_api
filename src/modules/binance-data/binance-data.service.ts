import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { GetUiKlineDto } from './dto/get-uiKline.dto';
import { firstValueFrom } from 'rxjs';
import { IResults } from '@/common/dto/result.type';
import { UiKlineType } from './dto/uiKline.type';
import { FETCH_BINANCE_FAILED, SUCCESS } from '@/common/constants/code';

@Injectable()
export class BinanceDataService {
  constructor(private readonly httpService: HttpService) {}

  async getUiKlinesData(query: GetUiKlineDto): Promise<IResults<UiKlineType>> {
    const { startTime, endTime } = query;

    const params = {
      ...query,
      startTime: new Date(startTime).getTime(),
      endTime: new Date(endTime).getTime(),
    };
    try {
      const { data } = await firstValueFrom(this.httpService.get('/api/v3/uiKlines', { params }));
      const formatData = data.map((data) => {
        return {
          openTime: new Date(data[0]),
          openPrice: data[1],
          highPrice: data[2],
          lowPrice: data[3],
          closePrice: data[4],
          volume: data[5],
          closeTime: new Date(data[6]),
          quoteAssetVolume: data[7],
          numberOfTrades: data[8],
          takerBuyBaseAssetVolume: data[9],
          takerBuyQuoteAssetVolume: data[10],
        };
      });
      return {
        code: SUCCESS,
        message: 'success',
        data: formatData,
      };
    } catch (error) {
      console.error(error);
      return {
        code: FETCH_BINANCE_FAILED,
        message: 'Fetch binance data failed',
      };
    }
  }
}
