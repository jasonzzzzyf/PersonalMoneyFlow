import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BudgetComponent } from './budget.component';

const routes: Routes = [
  { path: '', component: BudgetComponent }
];

@NgModule({
  declarations: [BudgetComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class BudgetModule { }
