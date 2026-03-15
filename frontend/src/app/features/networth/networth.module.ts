import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NetWorthComponent } from './networth.component';
import { AddAssetModalComponent } from './components/add-asset-modal/add-asset-modal.component';
import { AddLoanModalComponent } from './components/add-loan-modal/add-loan-modal.component';
import { LoanScannerComponent } from './components/loan-scanner/loan-scanner.component';

// NOTE: RouterModule.forChild() intentionally removed.
// /networth redirects to /investments (see app-routing.module.ts).
// NetWorthModule is imported by InvestmentsModule purely to share
// AddAssetModalComponent and AddLoanModalComponent.

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
    ReactiveFormsModule
  ],
  exports: [
    NetWorthComponent,
    LoanScannerComponent,
    AddAssetModalComponent,  // Used in Assets Hub (InvestmentsModule)
    AddLoanModalComponent    // Used in Assets Hub (InvestmentsModule)
  ]
})
export class NetWorthModule { }
