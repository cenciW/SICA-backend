import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { SicaResponse } from 'src/utils/sica-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const status = 200;
    let message = 'Internal Server Error';

    if (exception instanceof Error) {
      message = exception.message;
    } else {
      message = 'Internal Server Error';
    }

    const errorResponse = new SicaResponse({
      message,
      status,
    });

    response.status(200).json(errorResponse);
  }
}
