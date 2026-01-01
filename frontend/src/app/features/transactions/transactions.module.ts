// transactions.module.ts - 修复版本（保留 calendar-view）
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { TransactionAddComponent } from './transaction-add/transaction-add.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';

const routes: Routes = [
  {
    path: '',
    component: CalendarViewComponent
  },
  {
    path: 'add',
    component: TransactionAddComponent
  },
  {
    path: 'list',
    component: TransactionListComponent
  }
];

@NgModule({
  declarations: [
    TransactionListComponent,
    TransactionAddComponent,
    CalendarViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,              // 添加这个！修复 ngModel 错误
    ReactiveFormsModule,      // 添加这个！修复 formGroup 错误
    RouterModule.forChild(routes)
  ]
})
export class TransactionsModule { }
