// bottom-nav.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss']
})
export class BottomNavComponent {

  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  openAddTransaction(): void {
    this.router.navigate(['/transactions/add']);
  }

  isActive(route: string): boolean {
    const url = this.router.url;

    switch (route) {
      case 'details':
        return url.includes('/transactions') && !url.includes('/add');
      case 'budget':
        return url.includes('/budget') || url.includes('/recurring') || url.includes('/reminders') || url.includes('/dashboard');
      case 'invest':
        return url.includes('/investments');
      case 'profile':
        return url.includes('/profile') || url.includes('/analytics');
      default:
        return false;
    }
  }
}
