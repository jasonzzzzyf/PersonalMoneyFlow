// jwt.interceptor.ts - JWT Token 拦截器（修复版）
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 从 localStorage 获取 token
    const token = localStorage.getItem(environment.tokenKey);

    // 如果有 token 且请求是到我们的 API
    if (token && this.isApiUrl(request)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }

  /**
   * 检查是否是 API 请求
   */
  private isApiUrl(request: HttpRequest<any>): boolean {
    return request.url.startsWith(environment.apiUrl) || 
           request.url.startsWith(environment.pythonApiUrl);
  }
}
