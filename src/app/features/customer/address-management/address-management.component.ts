import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Address } from '../../../shared/models/booking.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-address-management',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './address-management.component.html',
  styleUrls: ['./address-management.component.scss']
})
export class AddressManagementComponent implements OnInit {
  private API_URL = 'http://localhost:3000';

  addresses: Address[] = [];
  isLoading = true;
  showAddressForm = false;
  isEditMode = false;
  editingAddressId: string | null = null;

  addressForm: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.addressForm = this.fb.group({
      label: ['', Validators.required],
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      isDefault: [false]
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.isLoading = true;
      this.http.get<Address[]>(`${this.API_URL}/addresses?customerId=${user.id}`).subscribe({
        next: (addresses) => {
          this.addresses = addresses;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading addresses:', error);
          this.isLoading = false;
        }
      });
    }
  }

  showAddForm(): void {
    this.showAddressForm = true;
    this.isEditMode = false;
    this.editingAddressId = null;
    this.addressForm.reset({ isDefault: false });
  }

  hideAddressForm(): void {
    this.showAddressForm = false;
    this.isEditMode = false;
    this.editingAddressId = null;
    this.addressForm.reset();
  }

  editAddress(address: Address): void {
    this.showAddressForm = true;
    this.isEditMode = true;
    this.editingAddressId = address.id;
    this.addressForm.patchValue({
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    });
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      Object.keys(this.addressForm.controls).forEach(key => {
        this.addressForm.get(key)?.markAsTouched();
      });
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const addressData = {
      ...this.addressForm.value,
      customerId: user.id,
      lat: 12.9716, // Mock coordinates
      lng: 77.5946
    };

    if (this.isEditMode && this.editingAddressId) {
      // Update existing address
      this.http.patch(`${this.API_URL}/addresses/${this.editingAddressId}`, addressData).subscribe({
        next: () => {
          alert('Address updated successfully');
          this.hideAddressForm();
          this.loadAddresses();
        },
        error: (error) => {
          console.error('Error updating address:', error);
          alert('Failed to update address');
        }
      });
    } else {
      // Create new address
      const newAddress = {
        id: this.generateId(),
        ...addressData
      };

      this.http.post(`${this.API_URL}/addresses`, newAddress).subscribe({
        next: () => {
          alert('Address added successfully');
          this.hideAddressForm();
          this.loadAddresses();
        },
        error: (error) => {
          console.error('Error adding address:', error);
          alert('Failed to add address');
        }
      });
    }
  }

  deleteAddress(addressId: string): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.http.delete(`${this.API_URL}/addresses/${addressId}`).subscribe({
        next: () => {
          alert('Address deleted successfully');
          this.loadAddresses();
        },
        error: (error) => {
          console.error('Error deleting address:', error);
          alert('Failed to delete address');
        }
      });
    }
  }

  setDefaultAddress(addressId: string): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    // First, unset all default addresses
    const updates = this.addresses.map(addr =>
      this.http.patch(`${this.API_URL}/addresses/${addr.id}`, { isDefault: addr.id === addressId })
    );

    // Execute all updates
    Promise.all(updates.map(obs => obs.toPromise())).then(() => {
      alert('Default address updated');
      this.loadAddresses();
    }).catch(error => {
      console.error('Error setting default address:', error);
      alert('Failed to set default address');
    });
  }

  generateId(): string {
    return 'addr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  goBack(): void {
    this.router.navigate(['/customer/dashboard']);
  }
}

