import { Component, OnInit } from '@angular/core';
import { ReminderService, ReminderResponse, ReminderRequest } from '../../shared/services/reminder.service';

@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.component.html',
  styleUrls: ['./reminders.component.scss']
})
export class RemindersComponent implements OnInit {

  overdueItems: ReminderResponse[] = [];
  upcomingItems: ReminderResponse[] = [];
  loading = false;
  error = '';
  activeTab: 'upcoming' | 'overdue' = 'upcoming';
  showAddForm = false;

  newReminder: ReminderRequest = {
    reminderName: '',
    amount: undefined,
    dueDate: '',
    recurrence: 'ONCE',
    notes: ''
  };

  constructor(private reminderService: ReminderService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';

    this.reminderService.getOverdue().subscribe({
      next: (data) => { this.overdueItems = data; },
      error: () => {}
    });

    this.reminderService.getAll().subscribe({
      next: (data) => {
        this.upcomingItems = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load reminders';
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.newReminder = {
      reminderName: '',
      amount: undefined,
      dueDate: today,
      recurrence: 'ONCE',
      notes: ''
    };
    this.showAddForm = true;
  }

  saveReminder(): void {
    if (!this.newReminder.reminderName || !this.newReminder.dueDate) return;
    this.reminderService.create(this.newReminder).subscribe({
      next: () => {
        this.showAddForm = false;
        this.loadAll();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create reminder';
      }
    });
  }

  markPaid(item: ReminderResponse): void {
    this.reminderService.markAsPaid(item.id).subscribe({
      next: () => this.loadAll(),
      error: () => { this.error = 'Failed to mark as paid'; }
    });
  }

  deleteReminder(id: number): void {
    if (!confirm('Delete this reminder?')) return;
    this.reminderService.delete(id).subscribe({
      next: () => this.loadAll(),
      error: () => { this.error = 'Failed to delete reminder'; }
    });
  }

  urgencyClass(item: ReminderResponse): string {
    if (item.daysUntilDue < 0)  return 'overdue';
    if (item.daysUntilDue <= 3) return 'urgent';
    if (item.daysUntilDue <= 7) return 'soon';
    return 'normal';
  }

  dueDateLabel(item: ReminderResponse): string {
    if (item.daysUntilDue < 0) return `${Math.abs(item.daysUntilDue)} days overdue`;
    if (item.daysUntilDue === 0) return 'Due today!';
    if (item.daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${item.daysUntilDue} days`;
  }

  displayedItems(): ReminderResponse[] {
    return this.activeTab === 'overdue' ? this.overdueItems : this.upcomingItems;
  }
}
