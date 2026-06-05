import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { CustomError } from 'src/utils/custom-error';
import { SicaResponse } from 'src/utils/sica-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let httpStatus = 500;
    let message = 'Internal Server Error';

    if (exception instanceof CustomError) {
      message = exception.message;
      httpStatus = exception.status;
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message ?? exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
      httpStatus = 500;
    }

    const errorResponse = new SicaResponse({ message, status: httpStatus });

    response.status(httpStatus).json(errorResponse);
  }
}
