// analytics.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { AnalyticsComponent } from './analytics.component';

const routes: Routes = [
  { path: '', component: AnalyticsComponent }
];

@NgModule({
  declarations: [
    AnalyticsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgChartsModule
  ]
})
export class AnalyticsModule { }
