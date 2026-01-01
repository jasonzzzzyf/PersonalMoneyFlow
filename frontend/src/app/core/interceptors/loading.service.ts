// loading.service.ts - 加载状态管理服务
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private requestCount = 0;

  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * 显示加载状态
   */
  show(): void {
    this.requestCount++;
    this.loadingSubject.next(true);
  }

  /**
   * 隐藏加载状态
   */
  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSubject.next(false);
    }
  }

  /**
   * 获取当前加载状态
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
