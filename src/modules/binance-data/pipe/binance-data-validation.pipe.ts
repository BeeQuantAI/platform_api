import { pipeErrorHandler } from '@/common/utils/pipeErrorHandler';
import { PipeTransform, Injectable } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class BinanceDateValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      return pipeErrorHandler(error);
    }
  }
}
