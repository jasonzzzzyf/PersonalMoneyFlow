// category.service.ts - 如果不存在则创建

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/categories`);
  }

  createCategory(category: any): Observable<any> {
    return this.http.post(`${this.API_URL}/categories`, category);
  }

  updateCategory(id: number, category: any): Observable<any> {
    return this.http.put(`${this.API_URL}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/categories/${id}`);
  }
}
