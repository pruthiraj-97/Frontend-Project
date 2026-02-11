import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Booking, Address } from '../../../shared/models/booking.model';
import { Service } from '../../../shared/models/service.model';
import { ExpertProfile } from '../../../shared/models/user.model';
import { Payment, Rating } from '../../../shared/models/payment.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnInit {
  private API_URL = 'http://localhost:3000';

  booking: Booking | null = null;
  service: Service | null = null;
  address: Address | null = null;
  expert: ExpertProfile | null = null;
  payment: Payment | null = null;
  rating: Rating | null = null;
  isLoading = true;
  error: string | null = null;

  // Mock expert location for tracking
  expertLocation = { lat: 12.9716, lng: 77.5946 };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.loadBookingDetails(bookingId);
    }
  }

  loadBookingDetails(bookingId: string): void {
    this.isLoading = true;
    this.http.get<Booking>(`${this.API_URL}/bookings/${bookingId}`).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.loadRelatedData(booking);
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.error = 'Failed to load booking details';
        this.isLoading = false;
      }
    });
  }

  loadRelatedData(booking: Booking): void {
    const requests: any = {
      service: this.http.get<Service>(`${this.API_URL}/services/${booking.serviceId}`),
      address: this.http.get<Address>(`${this.API_URL}/addresses/${booking.addressId}`),
      payment: this.http.get<Payment[]>(`${this.API_URL}/payments?bookingId=${booking.id}`),
      rating: this.http.get<Rating[]>(`${this.API_URL}/ratings?bookingId=${booking.id}`)
    };

    if (booking.expertId) {
      requests.expert = this.http.get<ExpertProfile[]>(`${this.API_URL}/expertProfiles?userId=${booking.expertId}`);
    }

    forkJoin(requests).subscribe({
      next: (results: any) => {
        this.service = results.service;
        this.address = results.address;
        this.payment = results.payment?.[0] || null;
        this.rating = results.rating?.[0] || null;
        this.expert = results.expert?.[0] || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading related data:', error);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

  getStatusLabel(status: string): string {
    return status.replace('_', ' ');
  }

  payNow(): void {
    if (!this.booking) return;

    if (confirm(`Proceed to pay ₹${this.booking.quotedAmount}?`)) {
      const paymentData = {
        id: `payment-${Date.now()}`,
        bookingId: this.booking.id,
        customerId: this.booking.customerId,
        amount: this.booking.quotedAmount,
        currency: this.booking.currency || 'INR',
        status: 'SUCCEEDED',
        method: 'UPI',
        transactionId: `txn_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.http.post(`${this.API_URL}/payments`, paymentData).subscribe({
        next: () => {
          this.http.patch(`${this.API_URL}/bookings/${this.booking!.id}`, {
            status: 'CONFIRMED',
            updatedAt: new Date().toISOString()
          }).subscribe({
            next: () => {
              alert('Payment Successful! Booking Confirmed.');
              this.loadBookingDetails(this.booking!.id);
            },
            error: () => alert('Payment status update failed.')
          });
        },
        error: () => alert('Payment initialization failed.')
      });
    }
  }

  cancelBooking(): void {
    if (!this.booking) return;

    console.log('User clicking cancel for booking:', this.booking.id);

    if (confirm('Are you sure you want to cancel this booking?')) {
      this.http.patch(`${this.API_URL}/bookings/${this.booking.id}`, {
        status: 'CANCELLED',
        updatedAt: new Date().toISOString()
      }).subscribe({
        next: () => {
          console.log('Cancellation successful in details');
          alert('Booking cancelled successfully');
          this.router.navigate(['/customer/bookings']);
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          alert('Failed to cancel booking');
        }
      });
    } else {
      console.log('User cancelled the cancellation dialog');
    }
  }

  modifyBooking(): void {
    if (this.booking) {
      this.router.navigate(['/customer/bookings', this.booking.id, 'modify']);
    }
  }

  rateService(): void {
    if (this.booking) {
      this.router.navigate(['/customer/bookings', this.booking.id, 'rate']);
    }
  }

  trackExpert(): void {
    // Navigate to tracking page or show modal
    alert('Tracking feature - Expert location will be shown on map');
  }

  contactExpert(): void {
    if (this.expert) {
      alert(`Contact Expert: ${this.expert.phone}`);
    }
  }

  goBack(): void {
    this.router.navigate(['/customer/bookings']);
  }
}

