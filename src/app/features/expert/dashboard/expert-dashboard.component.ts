import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { User, ExpertProfile } from '../../../shared/models/user.model';
import { Booking } from '../../../shared/models/booking.model';
import { forkJoin, filter, take } from 'rxjs';

interface ExpertEarnings {
  expertId: string;
  totalEarned: number;
  currency: string;
  completedJobs: number;
  pendingAmount: number;
  lastPayoutAt: string;
}

@Component({
  selector: 'app-expert-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './expert-dashboard.component.html',
  styleUrls: ['./expert-dashboard.component.scss']
})
export class ExpertDashboardComponent implements OnInit {
  private API_URL = 'http://localhost:3000';

  expertProfile: ExpertProfile | null = null;
  earnings: ExpertEarnings | null = null;
  activeJobs: Booking[] = [];
  recentJobs: any[] = [];
  isLoading = true;

  // Calculated metrics
  todayEarnings = 0;
  weekEarnings = 0;
  monthEarnings = 0;
  activeJobsCount = 0;

  newJobOffersCount = 0;

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
        this.loadDashboardData(user);
      }
    });
  }

  loadDashboardData(user: User): void {
    this.http.get<ExpertProfile[]>(`${this.API_URL}/expertProfiles?userId=${user.id}`).subscribe({
      next: (profiles) => {
        if (profiles.length > 0) {
          this.expertProfile = profiles[0];
          this.loadExpertData(this.expertProfile.userId);
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading expert profile:', error);
        this.isLoading = false;
      }
    });
  }

  loadExpertData(expertId: string): void {
    forkJoin({
      earnings: this.http.get<ExpertEarnings[]>(`${this.API_URL}/expertEarnings?expertId=${expertId}`),
      bookings: this.http.get<Booking[]>(`${this.API_URL}/bookings?expertId=${expertId}`),
      newOffers: this.http.get<Booking[]>(`${this.API_URL}/bookings?status=CONFIRMED`)
    }).subscribe({
      next: (data) => {
        if (data.earnings.length > 0) {
          this.earnings = data.earnings[0];
        } else {
          // Default earnings if none exist
          this.earnings = {
            expertId: expertId,
            totalEarned: 0,
            currency: 'INR',
            completedJobs: 0,
            pendingAmount: 0,
            lastPayoutAt: ''
          };
        }

        // Filter active jobs (CONFIRMED, IN_PROGRESS) belonging to expert
        this.activeJobs = data.bookings.filter(b =>
          b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS'
        );
        this.activeJobsCount = this.activeJobs.length;

        // Calculate new job offers (unassigned)
        this.newJobOffersCount = data.newOffers.filter(b => !b.expertId).length;

        // Get recent jobs (last 5 completed)
        const recent = data.bookings
          .filter(b => b.status === 'COMPLETED')
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);

        // Fetch service details for recent jobs
        if (recent.length > 0) {
          const serviceRequests = recent.map(job =>
            this.http.get<any>(`${this.API_URL}/services/${job.serviceId}`)
          );

          forkJoin(serviceRequests).subscribe(services => {
            this.recentJobs = recent.map((job, index) => ({
              ...job,
              serviceName: services[index].name
            }));
          });
        } else {
          this.recentJobs = [];
        }

        // Calculate earnings (mock calculations for demo)
        this.calculateEarnings(data.bookings);

        // Update total earnings from calculated data if 0
        if (this.earnings && this.earnings.totalEarned === 0) {
          const completed = data.bookings.filter(b => b.status === 'COMPLETED');
          const total = completed.reduce((sum, b) => sum + b.quotedAmount, 0);
          this.earnings.totalEarned = total;
          // Simplified pending amount logic: Total - some assumed paid amount (0 here as we don't have paid status on bookings)
          // or just set it to total for now if no payouts exist
          this.earnings.pendingAmount = total;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expert data:', error);
        this.isLoading = false;
      }
    });
  }

  calculateEarnings(bookings: Booking[]): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');

    this.todayEarnings = completedBookings
      .filter(b => new Date(b.updatedAt) >= today)
      .reduce((sum, b) => sum + b.quotedAmount, 0);

    this.weekEarnings = completedBookings
      .filter(b => new Date(b.updatedAt) >= weekAgo)
      .reduce((sum, b) => sum + b.quotedAmount, 0);

    this.monthEarnings = completedBookings
      .filter(b => new Date(b.updatedAt) >= monthAgo)
      .reduce((sum, b) => sum + b.quotedAmount, 0);
  }

  toggleAvailability(): void {
    if (!this.expertProfile) return;

    const newStatus = this.expertProfile.onlineStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';

    this.http.patch(`${this.API_URL}/expertProfiles/${this.expertProfile.id}`, {
      onlineStatus: newStatus
    }).subscribe({
      next: () => {
        if (this.expertProfile) {
          this.expertProfile.onlineStatus = newStatus;
        }
      },
      error: (error) => {
        console.error('Error updating availability:', error);
        alert('Failed to update availability');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

