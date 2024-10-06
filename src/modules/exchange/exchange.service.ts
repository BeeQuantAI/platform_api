import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange } from './models/exchange.entity';
import { Repository } from 'typeorm';
import { IResult } from '@/common/dto/result.type';
import {
  EXCHANGE_ALREADY_EXISTS,
  EXCHANGE_CREATION_FAILED,
  SUCCESS,
} from '@/common/constants/code';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>
  ) {}

  async createNewExchange(name: string): Promise<IResult<Exchange>> {
    try {
      const existedExchange = await this.exchangeRepository.findOne({ where: { name } });
      if (existedExchange) {
        return {
          code: EXCHANGE_ALREADY_EXISTS,
          message: `Exchange with name ${name} already exists`,
        };
      }

      const newExchange = this.exchangeRepository.create({ name });
      const savedExchange = await this.exchangeRepository.save(newExchange);

      return {
        code: SUCCESS,
        message: 'Exchange created successfully',
        data: savedExchange,
      };
    } catch (error) {
      return {
        code: EXCHANGE_CREATION_FAILED,
        message: 'An error occurred while creating the exchange',
      };
    }
  }

  async findExchangeById(id: string): Promise<Exchange> {
    return await this.exchangeRepository.findOne({ where: { id: id } });
  }

  async findByName(name: string): Promise<Exchange | null> {
    return await this.exchangeRepository.findOne({ where: { name } });
  }
}
