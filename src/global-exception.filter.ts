import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    //TODO: Investigate: Error: Cannot set headers after they are sent to the client,  code: 'ERR_HTTP_HEADERS_SENT'
  }
}