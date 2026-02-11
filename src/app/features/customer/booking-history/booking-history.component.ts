import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { Booking } from '../../../shared/models/booking.model';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-history.component.html',
  styleUrls: ['./booking-history.component.scss']
})
export class BookingHistoryComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  private readonly API_URL = 'http://localhost:3000';

  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  isLoading = true;
  selectedFilter = 'ALL';

  filters = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending Payment', value: 'PENDING_PAYMENT' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  currentUser: any = null;

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      this.currentUser = user;
      this.loadBookings();
    });
  }

  loadBookings(): void {
    if (this.currentUser) {
      this.isLoading = true;
      this.http.get<Booking[]>(`${this.API_URL}/bookings?customerId=${this.currentUser.id}&_sort=createdAt&_order=desc`).subscribe({
        next: (bookings) => {
          this.bookings = bookings;
          this.filteredBookings = bookings;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          this.isLoading = false;
        }
      });
    }
  }

  filterBookings(status: string): void {
    this.selectedFilter = status;
    if (status === 'ALL') {
      this.filteredBookings = this.bookings;
    } else {
      this.filteredBookings = this.bookings.filter(b => b.status === status);
    }
  }

  viewBookingDetails(bookingId: string): void {
    this.router.navigate(['/customer/bookings', bookingId]);
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace('_', '-');
  }

  getStatusLabel(status: string): string {
    return status.replace('_', ' ');
  }

  payNow(booking: Booking): void {
    if (confirm(`Proceed to pay ₹${booking.quotedAmount} for this booking?`)) {
      // Simulate payment processing
      const paymentData = {
        id: `payment-${Date.now()}`,
        bookingId: booking.id,
        customerId: booking.customerId,
        amount: booking.quotedAmount,
        currency: booking.currency || 'INR',
        status: 'SUCCEEDED',
        method: 'UPI',
        transactionId: `txn_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Create Payment Record
      this.http.post(`${this.API_URL}/payments`, paymentData).subscribe({
        next: () => {
          // 2. Update Booking Status
          this.http.patch(`${this.API_URL}/bookings/${booking.id}`, {
            status: 'CONFIRMED',
            updatedAt: new Date().toISOString()
          }).subscribe({
            next: () => {
              alert('Payment Successful! Booking Confirmed.');
              this.loadBookings(); // Reload to see updated status
            },
            error: () => alert('Payment failed. Please try again.')
          });
        },
        error: () => alert('Payment initialization failed.')
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

