// category.service.ts - 分类管理服务（修复路径）
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../../core/api/api.service';
import { DemoDataService } from '../../core/demo/demo-data.service';
import { environment } from '../../../environments/environment';

export interface Category {
  id: number;
  userId: number;
  categoryType: 'INCOME' | 'EXPENSE';
  categoryName: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private api: ApiService,
    private demoDataService: DemoDataService
  ) {}

  /**
   * 获取所有分类
   */
  getCategories(type?: 'INCOME' | 'EXPENSE'): Observable<Category[]> {
    if (environment.demoMode) {
      return of(this.demoDataService.getCategories(type) as Category[]);
    }
    const params = type ? { type } : {};
    return this.api.get<Category[]>('/categories', params);
  }

  /**
   * 创建自定义分类
   */
  createCategory(category: Partial<Category>): Observable<Category> {
    if (environment.demoMode) {
      return of(this.demoDataService.createCategory(category) as Category);
    }
    return this.api.post<Category>('/categories', category);
  }

  /**
   * 更新分类
   */
  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    if (environment.demoMode) {
      return of(this.demoDataService.updateCategory(id, category) as Category);
    }
    return this.api.put<Category>(`/categories/${id}`, category);
  }

  /**
   * 删除分类
   */
  deleteCategory(id: number): Observable<void> {
    if (environment.demoMode) {
      this.demoDataService.deleteCategory(id);
      return of(void 0);
    }
    return this.api.delete<void>(`/categories/${id}`);
  }
}
