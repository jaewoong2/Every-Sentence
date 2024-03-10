// logger.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const path = request.url; // 현재 요청의 URL 경로를 얻음
    const method = request.method; // 현재 요청의 HTTP 메서드를 얻음
    const className = context.getClass().name;

    this.logger.log(`[${method}] [${path}] - [${className}] START`);

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(`[${method}] [${path}] - [${className}] END`),
        ),
      );
  }
}
