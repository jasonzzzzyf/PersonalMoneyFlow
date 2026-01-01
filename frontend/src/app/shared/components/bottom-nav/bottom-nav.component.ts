// bottom-nav.component.ts - 5个Tab设计

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
    const currentUrl = this.router.url;
    
    switch(route) {
      case 'details':
        return currentUrl.includes('/transactions') && !currentUrl.includes('/add');
      case 'charts':
        return currentUrl.includes('/analytics');
      case 'invest':
        return currentUrl.includes('/investments');
      case 'profile':
        return currentUrl.includes('/profile');
      default:
        return false;
    }
  }
}
