// investments.component.ts - 合并 Portfolio + Net Worth

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-investments',
  templateUrl: './investments.component.html',
  styleUrls: ['./investments.component.scss']
})
export class InvestmentsComponent implements OnInit {
  
  activeTab: 'portfolio' | 'networth' = 'portfolio';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // 如果URL中有fragment，切换到对应的tab
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'networth') {
        this.activeTab = 'networth';
      }
    });
  }

  switchTab(tab: 'portfolio' | 'networth'): void {
    this.activeTab = tab;
  }
}
