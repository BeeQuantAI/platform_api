import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserExchange } from './models/user-exchange.entity';
import { UserExchangeService } from './user-exchange.service';
import { UserExchangeResolver } from './user-exchange.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([UserExchange])],
  providers: [UserExchangeService, UserExchangeResolver],
  exports: [UserExchangeService],
})
export class UserExchangeModule {}
