import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RecurringComponent } from './recurring.component';

const routes: Routes = [
  { path: '', component: RecurringComponent }
];

@NgModule({
  declarations: [RecurringComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class RecurringModule { }
