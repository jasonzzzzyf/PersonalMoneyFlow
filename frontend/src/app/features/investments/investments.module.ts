import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Main component with tabs
import { InvestmentsComponent } from './investments.component';

// Portfolio components
import { PortfolioComponent } from './portfolio/portfolio.component';
import { AddInvestmentDialogComponent } from './add-investment-dialog/add-investment-dialog.component';
import { TransactionDialogComponent } from './transaction-dialog/transaction-dialog.component';

// Import NetWorth module
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
    PortfolioComponent,
    AddInvestmentDialogComponent,
    TransactionDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NetWorthModule,  // Import NetWorth module
    RouterModule.forChild(routes)
  ]
})
export class InvestmentsModule { }
