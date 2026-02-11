import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { Booking } from '../../../shared/models/booking.model';

@Component({
  selector: 'app-modify-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modify-booking.component.html',
  styleUrls: ['./modify-booking.component.scss']
})
export class ModifyBookingComponent implements OnInit {
  private API_URL = 'http://localhost:3000';

  booking: Booking | null = null;
  modifyForm: FormGroup;
  isLoading = true;
  showCancelModal = false;
  cancelReason = '';

  services: any[] = [];
  experts: any[] = [];
  selectedService: any = null;
  paymentWarning = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.modifyForm = this.fb.group({
      scheduledDate: ['', Validators.required],
      scheduledTime: ['', Validators.required],
      serviceId: [''],
      expertId: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.loadBooking(bookingId);
    }
  }

  loadBooking(bookingId: string): void {
    this.http.get<Booking>(`${this.API_URL}/bookings/${bookingId}`).subscribe({
      next: (booking) => {
        this.booking = booking;

        // Prevent modification if expert is already assigned and accepted (status check)
        // If expert is assigned but status is PENDING_PAYMENT, allows modification if we want.
        // User request: "until expert haven't accepted". 
        // If status is CONFIRMED and expertId is set -> accepted.
        if (booking.expertId && booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED') {
          alert('This booking is already active/completed with an assigned expert and cannot be modified.');
          this.router.navigate(['/customer/bookings', booking.id]);
          return;
        }

        if (booking.scheduledStartTime) {
          const date = new Date(booking.scheduledStartTime);
          this.modifyForm.patchValue({
            scheduledDate: date.toISOString().split('T')[0],
            scheduledTime: date.toTimeString().slice(0, 5),
            notes: booking.notes || '',
            serviceId: booking.serviceId,
            expertId: booking.expertId || ''
          });
        }

        // Load services and experts to populate dropdowns
        this.loadServicesAndExperts();

        // Listen to service changes to update warning
        this.modifyForm.get('serviceId')?.valueChanges.subscribe(val => {
          this.paymentWarning = val !== this.booking?.serviceId;
          this.updateSelectedService(val);
        });

        this.modifyForm.get('expertId')?.valueChanges.subscribe(val => {
          // warning if expert changed? Maybe less critical for price unless expert has different rates
          // For now assume price is service-based.
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.isLoading = false;
      }
    });
  }

  loadServicesAndExperts(): void {
    // Load all services for simplicity or filter by current category
    // We'll load all to allow changing service entirely
    this.http.get<any[]>(`${this.API_URL}/services?isActive=true`).subscribe(services => {
      this.services = services;
      if (this.booking) {
        this.updateSelectedService(this.booking.serviceId);
      }
    });

    this.http.get<any[]>(`${this.API_URL}/expertProfiles?onlineStatus=ONLINE`).subscribe(experts => {
      this.experts = experts;
    });
  }

  updateSelectedService(serviceId: string): void {
    this.selectedService = this.services.find(s => s.id === serviceId);
  }

  updateBooking(): void {
    if (this.modifyForm.invalid || !this.booking) return;

    const formValue = this.modifyForm.value;
    const scheduledDateTime = new Date(`${formValue.scheduledDate}T${formValue.scheduledTime}`);

    // Check if critical fields changed
    const serviceChanged = formValue.serviceId !== this.booking.serviceId;
    const expertChanged = formValue.expertId !== (this.booking.expertId || '');

    let status = this.booking.status;
    let quotedAmount = this.booking.quotedAmount;

    if (serviceChanged) {
      status = 'PENDING_PAYMENT';
      quotedAmount = this.selectedService ? (this.selectedService.basePrice || this.selectedService.startingPrice) : quotedAmount;
    }

    // Prepare update payload
    const updateData: any = {
      scheduledStartTime: scheduledDateTime.toISOString(),
      notes: formValue.notes,
      serviceId: formValue.serviceId,
      expertId: formValue.expertId || null, // Allow unassigning or assigning
      status: status,
      quotedAmount: quotedAmount,
      updatedAt: new Date().toISOString()
    };

    if (serviceChanged) {
      if (!confirm('Changing the service requires a new payment. The previous payment will be refunded within a few hours. Proceed?')) {
        return;
      }
    }

    this.http.patch(`${this.API_URL}/bookings/${this.booking.id}`, updateData).subscribe({
      next: () => {
        if (serviceChanged) {
          alert('Booking updated. Please complete payment for the new service.');
          // Refund simulation message
          console.log('Initiating refund for previous amount...');
        } else {
          alert('Booking rescheduled successfully!');
        }
        this.router.navigate(['/customer/bookings', this.booking?.id]);
      },
      error: (error) => {
        console.error('Error updating booking:', error);
        alert('Failed to update booking');
      }
    });
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelReason = '';
  }

  cancelBooking(): void {
    console.log('Attempting to cancel booking:', this.booking?.id);
    if (!this.booking) {
      console.error('No booking to cancel');
      return;
    }

    if (!this.cancelReason) {
      alert('Please provide a reason for cancellation.');
      return;
    }

    this.http.patch(`${this.API_URL}/bookings/${this.booking.id}`, {
      status: 'CANCELLED',
      cancelReason: this.cancelReason,
      cancelledAt: new Date().toISOString()
    }).subscribe({
      next: () => {
        console.log('Cancellation successful');
        alert('Booking cancelled successfully. Refund will be processed within 5-7 business days.');
        this.router.navigate(['/customer/bookings']);
      },
      error: (error) => {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

