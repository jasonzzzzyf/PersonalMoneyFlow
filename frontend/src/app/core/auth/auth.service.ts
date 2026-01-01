// auth.service.ts - 认证服务（修复版）
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem(environment.userKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * 登录 - 支持两种调用方式
   */
  login(emailOrRequest: string | LoginRequest, password?: string): Observable<AuthResponse> {
    let loginData: LoginRequest;
    
    // 判断是对象还是分开的参数
    if (typeof emailOrRequest === 'string' && password) {
      loginData = { email: emailOrRequest, password };
    } else if (typeof emailOrRequest === 'object') {
      loginData = emailOrRequest;
    } else {
      throw new Error('Invalid login parameters');
    }

    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, loginData)
      .pipe(
        tap(response => {
          // 保存 token
          localStorage.setItem(environment.tokenKey, response.token);
          
          // 保存用户信息
          const user: User = {
            id: response.userId,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName
          };
          localStorage.setItem(environment.userKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * 注册
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, data)
      .pipe(
        tap(response => {
          // 注册成功后自动登录
          localStorage.setItem(environment.tokenKey, response.token);
          
          const user: User = {
            id: response.userId,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName
          };
          localStorage.setItem(environment.userKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * 登出
   */
  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * 获取 Token
   */
  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/me`);
  }

  /**
   * 修改密码
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/password`, {
      oldPassword,
      newPassword
    });
  }
}
