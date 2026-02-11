import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../shared/models/user.model';
import { Booking } from '../../../shared/models/booking.model';
import { Service } from '../../../shared/models/service.model';
import { forkJoin, filter, take } from 'rxjs';

@Component({
  selector: 'app-job-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-offers.component.html',
  styleUrls: ['./job-offers.component.scss']
})
export class JobOffersComponent implements OnInit {
  private API_URL = 'http://localhost:3000';

  availableJobs: any[] = [];
  activeJobs: any[] = [];
  isLoading = true;
  sortBy = 'payment';
  activeTab = 'available';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      if (user) {
        this.loadJobs(user);
      }
    });
  }

  loadJobs(user: User): void {
    this.isLoading = true;

    // 1. Fetch Available Jobs (Unassigned)
    const availableRequest = this.http.get<Booking[]>(`${this.API_URL}/bookings?status=CONFIRMED`);

    // 2. Fetch My Active Jobs (Assigned to me, Confirmed or In Progress)
    const myJobsRequest = this.http.get<Booking[]>(`${this.API_URL}/bookings?expertId=${user.id}&_sort=createdAt&_order=desc`);

    forkJoin({ available: availableRequest, myJobs: myJobsRequest }).subscribe({
      next: (results) => {
        // Filter unassigned for available
        const unassigned = results.available.filter(b => !b.expertId);

        // Filter active status for my jobs
        const active = results.myJobs.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');

        this.processJobs(unassigned, 'available');
        this.processJobs(active, 'active');
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.isLoading = false;
      }
    });
  }

  processJobs(bookings: Booking[], type: 'available' | 'active'): void {
    if (bookings.length === 0) {
      if (type === 'available') this.availableJobs = [];
      else this.activeJobs = [];

      if (type === 'active') this.isLoading = false; // Done loading both
      return;
    }

    const requests = bookings.map(booking =>
      forkJoin({
        booking: Promise.resolve(booking),
        service: this.http.get<Service>(`${this.API_URL}/services/${booking.serviceId}`),
        address: this.http.get<any>(`${this.API_URL}/addresses/${booking.addressId}`)
      })
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        const processed = results.map(r => ({
          ...r.booking,
          service: r.service,
          address: r.address,
          distance: Math.floor(Math.random() * 10) + 1
        }));

        if (type === 'available') {
          this.availableJobs = processed;
        } else {
          this.activeJobs = processed;
        }

        this.applySorting();
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error processing ${type} jobs:`, error);
        this.isLoading = false;
      }
    });
  }

  applySorting(): void {
    if (this.sortBy === 'payment') {
      this.availableJobs.sort((a, b) => b.quotedAmount - a.quotedAmount);
    } else if (this.sortBy === 'distance') {
      this.availableJobs.sort((a, b) => a.distance - b.distance);
    } else if (this.sortBy === 'time') {
      this.availableJobs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.applySorting();
  }

  acceptJob(job: any): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    if (confirm(`Accept this job for ₹${job.quotedAmount}?`)) {
      this.http.patch(`${this.API_URL}/bookings/${job.id}`, {
        expertId: user.id,
        status: 'CONFIRMED'
      }).subscribe({
        next: () => {
          alert('Job accepted successfully!');
          // Refresh jobs - we can reuse the current user from authService since we are in a callback
          const user = this.authService.getCurrentUser();
          if (user) {
            this.loadJobs(user);
          }
        },
        error: (error) => {
          console.error('Error accepting job:', error);
          alert('Failed to accept job');
        }
      });
    }
  }

  rejectJob(job: any): void {
    this.availableJobs = this.availableJobs.filter(j => j.id !== job.id);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

