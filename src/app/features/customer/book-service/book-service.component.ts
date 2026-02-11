import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { Category, Service, ServiceAddon } from '../../../shared/models/service.model';
import { Address } from '../../../shared/models/booking.model';

@Component({
  selector: 'app-book-service',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './book-service.component.html',
  styleUrls: ['./book-service.component.scss']
})
export class BookServiceComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  private readonly API_URL = 'http://localhost:3000';

  currentStep = 1;
  totalSteps = 5;

  categories: Category[] = [];
  services: Service[] = [];
  selectedCategory: Category | null = null;
  selectedService: Service | null = null;
  selectedAddons: ServiceAddon[] = [];
  addresses: Address[] = [];
  selectedAddress: Address | null = null;

  isLoading = false;

  bookingForm: FormGroup;

  experts: any[] = [];

  constructor() {
    this.bookingForm = this.fb.group({
      bookingType: ['ASAP', Validators.required],
      scheduledDate: [''],
      scheduledTime: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadAddresses();

    // Check if category is pre-selected from query params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectCategoryById(params['category']);
      }
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.http.get<Category[]>(`${this.API_URL}/categories?isActive=true`).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
      }
    });
  }

  loadAddresses(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.http.get<Address[]>(`${this.API_URL}/addresses?userId=${user.id}`).subscribe({
        next: (addresses) => {
          this.addresses = addresses;
          if (addresses.length > 0 && !this.selectedAddress) {
            this.selectedAddress = addresses.find(a => a.isDefault) || addresses[0];
          }
        },
        error: (error) => {
          console.error('Error loading addresses:', error);
        }
      });
    }
  }

  selectCategoryById(categoryId: string): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      this.selectCategory(category);
    }
  }

  selectCategory(category: Category): void {
    this.selectedCategory = category;
    this.loadServices(category.id);
    this.loadExperts(category.name);
    this.currentStep = 2;
  }

  loadServices(categoryId: string): void {
    this.isLoading = true;
    this.http.get<Service[]>(`${this.API_URL}/services?categoryId=${categoryId}&isActive=true`).subscribe({
      next: (services) => {
        this.services = services;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.isLoading = false;
      }
    });
  }

  loadExperts(categoryName: string): void {
    // Fetch experts who are ONLINE and have the skill matching the category name
    this.http.get<any[]>(`${this.API_URL}/expertProfiles?onlineStatus=ONLINE`).subscribe({
      next: (experts) => {
        // Filter locally for skills since json-server filtering on arrays is limited
        this.experts = experts.filter(e => e.skills && e.skills.includes(categoryName));
      },
      error: (error) => {
        console.error('Error loading experts:', error);
      }
    });
  }

  selectService(service: Service): void {
    this.selectedService = service;
    this.currentStep = 3;
  }

  toggleAddon(addon: ServiceAddon): void {
    const index = this.selectedAddons.findIndex(a => a.id === addon.id);
    if (index > -1) {
      this.selectedAddons.splice(index, 1);
    } else {
      this.selectedAddons.push(addon);
    }
  }

  isAddonSelected(addon: ServiceAddon): boolean {
    return this.selectedAddons.some(a => a.id === addon.id);
  }

  selectAddress(address: Address): void {
    this.selectedAddress = address;
  }

  getTotalAmount(): number {
    let total = this.selectedService?.startingPrice || 0;
    this.selectedAddons.forEach(addon => {
      total += addon.priceDelta;
    });
    return total;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  proceedToPayment(): void {
    if (!this.selectedService || !this.selectedAddress) {
      alert('Please select a service and address');
      return;
    }

    const bookingType = this.bookingForm.value.bookingType;

    // Check if expert is available for ASAP booking
    if (bookingType === 'ASAP' && this.experts.length === 0) {
      alert('No experts are currently online for ASAP booking. Please choose "Schedule for Later" to book a service.');
      return;
    }

    const bookingData = {
      id: `booking-${Date.now()}`, // Generate ID explicitly for json-server if needed
      customerId: this.authService.getCurrentUser()?.id,
      serviceId: this.selectedService.id,
      addressId: this.selectedAddress.id,
      bookingType: bookingType,
      scheduledDate: this.bookingForm.value.scheduledDate,
      scheduledTime: this.bookingForm.value.scheduledTime,
      notes: this.bookingForm.value.notes,
      addonIds: this.selectedAddons.map(a => a.id),
      quotedAmount: this.getTotalAmount(),
      status: 'PENDING_PAYMENT',
      currency: 'INR',
      expertId: null, // Explicitly set to null initially
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating booking:', bookingData);

    this.http.post(`${this.API_URL}/bookings`, bookingData).subscribe({
      next: (booking: any) => {
        alert('Booking created successfully! Redirecting to payment gateway...');
        // In a real app, redirection to Stripe/Razorpay happens here
        // For now, we simulate the payment page or go to booking details
        // Since we don't have a dedicated payment page, we'll go to bookings
        // but let's simulate the user expectation.
        setTimeout(() => {
          this.router.navigate(['/customer/bookings']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        alert('Failed to create booking. Please try again.');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/customer/dashboard']);
  }
}

