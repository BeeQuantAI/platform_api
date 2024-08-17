import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';

@Catch(HttpException)
export class GqlHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = exception.getResponse() as any;
    const message = response?.message || 'Internal server error';
    const statusCode = exception.getStatus();
    const code = response?.code || '';

    throw new ApolloError(message, code, {
      statusCode: statusCode,
    });
  }
}
