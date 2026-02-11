import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { Booking } from '../../../shared/models/booking.model';
import { Service } from '../../../shared/models/service.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})
export class JobDetailsComponent implements OnInit {
  private API_URL = 'http://localhost:3000';

  booking: Booking | null = null;
  service: Service | null = null;
  address: any = null;
  customer: any = null;
  isLoading = true;

  showOtpModal = false;
  otpInput = '';
  generatedOtp = '1234'; // Mock OTP

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.loadJobDetails(jobId);
    }
  }

  loadJobDetails(jobId: string): void {
    this.http.get<Booking>(`${this.API_URL}/bookings/${jobId}`).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.loadRelatedData(booking);
      },
      error: (error) => {
        console.error('Error loading job:', error);
        this.isLoading = false;
      }
    });
  }

  loadRelatedData(booking: Booking): void {
    forkJoin({
      service: this.http.get<Service>(`${this.API_URL}/services/${booking.serviceId}`),
      address: this.http.get<any>(`${this.API_URL}/addresses/${booking.addressId}`),
      customer: this.http.get<any>(`${this.API_URL}/users/${booking.customerId}`)
    }).subscribe({
      next: (data) => {
        this.service = data.service;
        this.address = data.address;
        this.customer = data.customer;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading related data:', error);
        this.isLoading = false;
      }
    });
  }

  navigateToLocation(): void {
    if (this.address) {
      const query = encodeURIComponent(`${this.address.line1}, ${this.address.city}, ${this.address.state}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  }

  callCustomer(): void {
    if (this.customer) {
      alert(`Calling ${this.customer.fullName} at ${this.customer.phone}...`);
    }
  }

  startJob(): void {
    this.showOtpModal = true;
  }

  verifyOtpAndStart(): void {
    if (this.otpInput === this.generatedOtp) {
      this.http.patch(`${this.API_URL}/bookings/${this.booking!.id}`, {
        status: 'IN_PROGRESS',
        actualStartTime: new Date().toISOString()
      }).subscribe({
        next: () => {
          alert('Job started successfully!');
          this.showOtpModal = false;
          this.loadJobDetails(this.booking!.id);
        },
        error: (error) => {
          console.error('Error starting job:', error);
          alert('Failed to start job');
        }
      });
    } else {
      alert('Invalid OTP. Please try again.');
    }
  }

  endJob(): void {
    if (confirm('Are you sure you want to end this job?')) {
      this.http.patch(`${this.API_URL}/bookings/${this.booking!.id}`, {
        status: 'COMPLETED',
        actualEndTime: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }).subscribe({
        next: () => {
          alert('Job completed successfully!');
          this.router.navigate(['/expert/dashboard']);
        },
        error: (error) => {
          console.error('Error ending job:', error);
          alert('Failed to end job');
        }
      });
    }
  }

  closeOtpModal(): void {
    this.showOtpModal = false;
    this.otpInput = '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}


