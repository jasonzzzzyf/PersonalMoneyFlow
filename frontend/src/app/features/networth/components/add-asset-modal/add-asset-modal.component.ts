// add-asset-modal.component.ts - 修复版

import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NetWorthService, Asset } from '../../../../core/services/networth.service';

@Component({
  selector: 'app-add-asset-modal',
  templateUrl: './add-asset-modal.component.html',
  styleUrls: ['./add-asset-modal.component.scss']
})
export class AddAssetModalComponent {

  @Output() close = new EventEmitter<void>();
  @Output() assetCreated = new EventEmitter<Asset>();

  assetForm: FormGroup;
  submitted = false;
  saving = false;

  assetTypes = [
    { value: 'CASH', label: 'Cash / Savings', icon: '💰', description: 'Bank accounts, cash on hand' },
    { value: 'REAL_ESTATE', label: 'Real Estate', icon: '🏠', description: 'Properties, land' },
    { value: 'VEHICLE', label: 'Vehicle', icon: '🚗', description: 'Cars, motorcycles, boats' },
    { value: 'OTHER', label: 'Other Assets', icon: '💎', description: 'Jewelry, collectibles, etc.' }
  ];

  constructor(
    private fb: FormBuilder,
    private networthService: NetWorthService
  ) {
    this.assetForm = this.fb.group({
      assetType: ['', Validators.required],
      assetName: ['', Validators.required],
      currentValue: ['', [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  selectAssetType(type: string): void {
    this.assetForm.patchValue({ assetType: type });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.assetForm.valid && !this.saving) {
      this.saving = true;
      const assetData: Asset = this.assetForm.value;

      this.networthService.createAsset(assetData).subscribe({
        next: (response: Asset) => {
          console.log('Asset created:', response);
          this.assetCreated.emit(response);
          this.closeModal();
        },
        error: (error: any) => {
          console.error('Error creating asset:', error);
          this.saving = false;
          alert('Failed to create asset: ' + (error.message || 'Unknown error'));
        }
      });
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.assetForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }
}
