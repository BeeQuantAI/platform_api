import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange } from './models/exchange.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>
  ) {}

  async createNewExchange(name: string): Promise<Exchange> {
    const newExchange = this.exchangeRepository.create({ name });
    return await this.exchangeRepository.save(newExchange);
  }

  async findExchangeById(id: string): Promise<Exchange> {
    return await this.exchangeRepository.findOne({ where: { id: id } });
  }
}
