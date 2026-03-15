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
          errorMessage = `Client error: ${error.error.message}`;
        } else {
          switch (error.status) {
            case 401:
              localStorage.removeItem(environment.tokenKey);
              localStorage.removeItem(environment.userKey);
              this.router.navigate(['/auth/login']);
              errorMessage = 'Session expired. Please log in again.';
              break;

            case 403:
              errorMessage = 'You do not have permission to access this resource.';
              break;

            case 404:
              errorMessage = 'The requested resource was not found.';
              break;

            case 500:
              errorMessage = 'Internal server error. Please try again later.';
              break;

            default:
              errorMessage = error.error?.message || error.message || 'An unknown error occurred.';
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
