import { Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import {
  NOT_EMPTY,
  VALIDATE_ERROR,
  UNKNOWN_ERROR,
  EXCHANGE_KEY_NOT_FOUND,
} from '@/common/constants/code';
import { EmptyFiledException } from '@/exceptions/empty-field.exception';
import { InvalidInputException } from '@/exceptions/invalid-input.exception';
import { GraphQLError } from 'graphql';

@Catch(EmptyFiledException, InvalidInputException, NotFoundException)
export class ExchangeKeyPipeErrorFilter implements ExceptionFilter {
  catch(exception: EmptyFiledException | InvalidInputException | NotFoundException) {
    let errorCode: number;
    let errorMessage: string;
    switch (exception.constructor) {
      case EmptyFiledException:
        errorCode = NOT_EMPTY;
        errorMessage = exception.message;
        break;
      case InvalidInputException:
        errorCode = VALIDATE_ERROR;
        errorMessage = exception.message;
        break;
      case NotFoundException:
        errorCode = EXCHANGE_KEY_NOT_FOUND;
        errorMessage = exception.message;
        break;
      default:
        errorCode = UNKNOWN_ERROR;
        errorMessage = exception.message;
    }

    throw new GraphQLError(errorMessage, {
      extensions: { code: errorCode },
    });
  }
}
