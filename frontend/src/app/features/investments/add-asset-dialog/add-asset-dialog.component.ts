// src/app/features/investments/add-asset-dialog/add-asset-dialog.component.ts

import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface AssetType {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-add-asset-dialog',
  templateUrl: './add-asset-dialog.component.html',
  styleUrls: ['./add-asset-dialog.component.scss']
})
export class AddAssetDialogComponent {
  assetForm: FormGroup;
  
  assetTypes: AssetType[] = [
    { value: 'CASH', label: 'Cash', icon: '💰' },
    { value: 'REAL_ESTATE', label: 'Real Estate', icon: '🏠' },
    { value: 'VEHICLE', label: 'Vehicle', icon: '🚗' },
    { value: 'OTHER', label: 'Other', icon: '📦' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddAssetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.assetForm = this.fb.group({
      assetType: ['CASH', Validators.required],
      assetName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      currentValue: ['', [Validators.required, Validators.min(0)]],
      notes: ['', Validators.maxLength(1000)]
    });
  }

  selectAssetType(type: string): void {
    this.assetForm.patchValue({ assetType: type });
  }

  onSubmit(): void {
    if (this.assetForm.valid) {
      const formData = {
        ...this.assetForm.value,
        currentValue: parseFloat(this.assetForm.value.currentValue)
      };
      this.dialogRef.close(formData);
    } else {
      this.markFormGroupTouched(this.assetForm);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.assetForm.get(fieldName);
    return !!(field && field.errors && field.errors[errorType] && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.assetForm.get(fieldName);
    
    if (!field || !field.touched || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }
    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} cannot exceed ${maxLength} characters`;
    }
    if (field.errors['min']) {
      return `${this.getFieldLabel(fieldName)} must be greater than or equal to 0`;
    }

    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      assetType: 'Asset type',
      assetName: 'Asset name',
      currentValue: 'Current value',
      notes: 'Notes'
    };
    return labels[fieldName] || fieldName;
  }
}
