// app.component.ts

import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'PersonalMoneyManagement';
  showBottomNav = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateNavVisibility();
      });
  }

  private updateNavVisibility(): void {
    this.showBottomNav = this.shouldShowBottomNav();
  }

  shouldShowBottomNav(): boolean {
    const currentRoute = this.router.url;
    const hideNavRoutes = ['/auth'];
    
    // 只在已登录且不在认证页面时显示底部导航
    return this.authService.isLoggedIn() && !hideNavRoutes.some(route => currentRoute.startsWith(route));
  }
}
