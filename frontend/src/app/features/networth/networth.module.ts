import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NetWorthComponent } from './networth.component';
import { AddAssetModalComponent } from './components/add-asset-modal/add-asset-modal.component';
import { AddLoanModalComponent } from './components/add-loan-modal/add-loan-modal.component';
import { LoanScannerComponent } from './components/loan-scanner/loan-scanner.component';

const routes: Routes = [
  {
    path: '',
    component: NetWorthComponent
  }
];

@NgModule({
  declarations: [
    NetWorthComponent,
    AddAssetModalComponent,
    AddLoanModalComponent,
    LoanScannerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    NetWorthComponent,    // Used in InvestmentsModule
    LoanScannerComponent  // Can be embedded in investments page
  ]
})
export class NetWorthModule { }
