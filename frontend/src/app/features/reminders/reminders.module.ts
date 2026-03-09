import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RemindersComponent } from './reminders.component';

const routes: Routes = [
  { path: '', component: RemindersComponent }
];

@NgModule({
  declarations: [RemindersComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class RemindersModule { }
