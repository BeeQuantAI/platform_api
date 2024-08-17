import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(message: string, statusCode: number, data?: any) {
    super(
      {
        message,
        data,
      },
      statusCode
    );
  }
}
