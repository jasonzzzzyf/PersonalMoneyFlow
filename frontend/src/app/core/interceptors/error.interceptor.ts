// error.interceptor.ts - 错误处理拦截器（修复版）
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
          // 客户端错误
          errorMessage = `客户端错误: ${error.error.message}`;
        } else {
          // 服务器错误
          switch (error.status) {
            case 401:
              // 未授权 - 清除 token 并跳转到登录页
              localStorage.removeItem(environment.tokenKey);
              localStorage.removeItem(environment.userKey);
              this.router.navigate(['/auth/login']);
              errorMessage = '登录已过期，请重新登录';
              break;
            
            case 403:
              errorMessage = '没有权限访问此资源';
              break;
            
            case 404:
              errorMessage = '请求的资源不存在';
              break;
            
            case 500:
              errorMessage = '服务器内部错误';
              break;
            
            default:
              errorMessage = error.error?.message || error.message || '未知错误';
          }
        }

        // 在开发模式下打印详细错误
        if (environment.enableDebugMode) {
          console.error('HTTP Error:', error);
          console.error('Error Message:', errorMessage);
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
