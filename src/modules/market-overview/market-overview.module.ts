import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MarketOverviewService } from './market-overview.service';
import { MarketOverviewResolver } from './market-overview.resolver';

@Module({
  imports: [HttpModule],
  providers: [MarketOverviewService, MarketOverviewResolver],
})
export class MarketOverviewModule {}
