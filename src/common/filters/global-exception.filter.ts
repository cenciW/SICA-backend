import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { CustomError } from 'src/utils/custom-error';
import { SicaResponse } from 'src/utils/sica-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    let status = 200;
    let message = 'Internal Server Error';

    if (exception instanceof CustomError) {
      message = exception.message;
      status = exception.status;
    } else if (exception instanceof Error) {
      message = exception.message;
      status = 500;
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
