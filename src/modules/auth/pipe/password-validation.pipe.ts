import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import * as Joi from 'joi';
import { passwordPatten } from '@/common/utils/helpers';

@Injectable()
export class PasswordValidationPipe implements PipeTransform {
  private readonly schema = Joi.string().pattern(passwordPatten).messages({
    'string.pattern.base': 'password must contain 8 to 32 characters, including letter, number and special character.'
  });

  transform(value: any): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('Validation failed: password must be a string');
    }
    const { error } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException(`Validation failed: ${error.message}`);
    }
    return value;
  }
}
