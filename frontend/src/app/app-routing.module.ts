// app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/transactions',
    pathMatch: 'full'
  },
  // ── Auth ─────────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  // ── Core tabs ────────────────────────────────────────────────
  {
    path: 'transactions',
    loadChildren: () => import('./features/transactions/transactions.module').then(m => m.TransactionsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'analytics',
    loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'investments',
    loadChildren: () => import('./features/investments/investments.module').then(m => m.InvestmentsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  // ── Phase 2 features ─────────────────────────────────────────
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'budget',
    loadChildren: () => import('./features/budget/budget.module').then(m => m.BudgetModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'recurring',
    loadChildren: () => import('./features/recurring/recurring.module').then(m => m.RecurringModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'reminders',
    loadChildren: () => import('./features/reminders/reminders.module').then(m => m.RemindersModule),
    canActivate: [AuthGuard]
  },
  // ── Other ─────────────────────────────────────────────────────
  {
    path: 'categories',
    loadChildren: () => import('./features/categories/categories.module').then(m => m.CategoriesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'networth',
    redirectTo: '/investments',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/transactions'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
