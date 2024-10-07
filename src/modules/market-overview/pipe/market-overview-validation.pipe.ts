import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { MARKET_OVERVIEW_INVALID_SYMBOL } from '@/common/constants/code';

const COIN_LIST = [
  'BTC',
  'ETH',
  'BNB',
  'SOL',
  'USDC',
  'XRP',
  'DOGE',
  'TON',
  'ADA',
  'SHIB',
  'AVAX',
  'TRX',
  'DOT',
  'BCH',
  'LINK',
  'NEAR',
  'MATIC',
  'ICP',
  'LTC',
  'DAI',
] as const;

const symbolSchema = z.enum(COIN_LIST);

@Injectable()
export class SymbolValidationPipe implements PipeTransform {
  transform(value: any) {
    try {
      return symbolSchema.parse(value);
    } catch (error) {
      throw new BadRequestException({
        code: MARKET_OVERVIEW_INVALID_SYMBOL,
        message: `Invalid symbol: ${value}. Please provide a valid cryptocurrency symbol.`,
      });
    }
  }
}

export type ValidSymbol = z.infer<typeof symbolSchema>;
