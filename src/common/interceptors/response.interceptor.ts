import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SicaResponse } from 'src/utils/sica-response';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  SicaResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SicaResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Se já for uma instância de SicaResponse, retorna como está
        if (data instanceof SicaResponse) {
          return data;
        }

        return new SicaResponse({
          message: 'Success',
          status: 200,
          data,
        });
      }),
    );
  }
}
