// loading.interceptor.ts - 加载状态拦截器
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 开始加载
    this.loadingService.show();

    return next.handle(request).pipe(
      finalize(() => {
        // 请求完成（无论成功或失败）
        this.loadingService.hide();
      })
    );
  }
}
