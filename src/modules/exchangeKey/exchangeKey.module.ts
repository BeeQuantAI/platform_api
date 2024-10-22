import { Module, ConsoleLogger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeKey } from './models/exchangeKey.entity';
import { ExchangeKeyService } from './exchangeKey.service';
import { ExchangeKeyResolver } from './exchangeKey.resolver';
import { UserExchangeModule } from '../user-exchange/user-exchange.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeKey]),
    UserExchangeModule,
    ExchangeModule,
    AuthModule,
  ],
  providers: [ConsoleLogger, ExchangeKeyService, ExchangeKeyResolver],
  exports: [ExchangeKeyService],
})
export class ExchangeKeyModule {}
