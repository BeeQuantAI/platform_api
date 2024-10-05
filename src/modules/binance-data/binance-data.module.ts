import { Module } from '@nestjs/common';
import { BinanceDataService } from './binance-data.service';
import { HttpModule } from '@nestjs/axios';
import { BinanceDataResolver } from './binance-data.resolver';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://data-api.binance.vision',
      timeout: 5000,
    }),
  ],
  providers: [BinanceDataService, HttpModule, BinanceDataResolver],
})
export class BinanceDataModule {}
