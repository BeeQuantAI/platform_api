import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import * as Joi from 'joi';
import { EmptyFiledException } from '../../../exceptions/empty-field.exception';
import { InvalidInputException } from '../../../exceptions/invalid-input.exception';

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private schema: Joi.ObjectSchema) {}

  transform(value: any) {
    const { error, value: validatedValue } = this.schema.validate(value);
    if (error) {
      const path = error.details[0].path[0];
      const type = error.details[0].type;
      const message = error.details[0].message;
      this.errorMatcher(path, type, message);
    }
    return validatedValue;
  }

  private errorMatcher(path, type, message) {
    switch (type) {
      case 'string.pattern.base':
        throw new InvalidInputException(message);
      case 'any.required':
        throw new EmptyFiledException(`"${path}" is required`);
      case 'string.email':
        throw new InvalidInputException(`"${path}" must be a valid email`);
      default:
        throw new BadRequestException(message);
    }
  }
}
