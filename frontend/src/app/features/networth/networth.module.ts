import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NetWorthComponent } from './networth.component';

const routes: Routes = [
  {
    path: '',
    component: NetWorthComponent
  }
];

@NgModule({
  declarations: [
    NetWorthComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    NetWorthComponent  // Export so it can be used in InvestmentsModule
  ]
})
export class NetWorthModule { }
