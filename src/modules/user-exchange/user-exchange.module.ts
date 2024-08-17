import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserExchange } from './models/user-exchange.entity';
import { UserExchangeService } from './user-exchange.service';
import { UserExchangeResolver } from './user-exchange.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserExchange]), AuthModule],
  providers: [UserExchangeService, UserExchangeResolver],
  exports: [UserExchangeService],
})
export class UserExchangeModule {}
