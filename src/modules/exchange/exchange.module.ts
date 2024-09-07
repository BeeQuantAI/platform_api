import { ConsoleLogger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from './models/exchange.entity';
import { ExchangeService } from './exchange.service';
import { UserExchangeModule } from '../user-exchange/user-exchange.module';

@Module({
  imports: [TypeOrmModule.forFeature([Exchange]), UserExchangeModule],
  providers: [ConsoleLogger, ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
