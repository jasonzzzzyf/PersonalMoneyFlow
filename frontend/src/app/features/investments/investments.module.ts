import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Main unified Assets Hub component
import { InvestmentsComponent } from './investments.component';

// Sub-dialogs used by the hub
import { AddInvestmentDialogComponent } from './add-investment-dialog/add-investment-dialog.component';
import { TransactionDialogComponent } from './transaction-dialog/transaction-dialog.component';

// NetWorthModule exports AddAssetModalComponent, AddLoanModalComponent, NetWorthComponent
import { NetWorthModule } from '../networth/networth.module';

const routes: Routes = [
  {
    path: '',
    component: InvestmentsComponent
  }
];

@NgModule({
  declarations: [
    InvestmentsComponent,
    AddInvestmentDialogComponent,
    TransactionDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NetWorthModule,           // Provides AddAssetModal, AddLoanModal
    RouterModule.forChild(routes)
  ]
})
export class InvestmentsModule { }
