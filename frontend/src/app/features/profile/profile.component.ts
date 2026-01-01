// profile.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  constructor(private router: Router) {}

  changePassword(): void {
    // TODO: 实现修改密码功能
    console.log('Change password clicked');
  }

  toggleDarkMode(): void {
    // TODO: 实现暗黑模式切换
    console.log('Dark mode toggle clicked');
  }

  changeCurrency(): void {
    // TODO: 实现货币切换
    console.log('Change currency clicked');
  }

  openHelp(): void {
    // TODO: 打开帮助页面
    console.log('Help clicked');
  }

  contactSupport(): void {
    // TODO: 打开联系支持
    console.log('Contact support clicked');
  }

  logout(): void {
    // TODO: 实现登出逻辑
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      this.router.navigate(['/auth/login']);
    }
  }
}
