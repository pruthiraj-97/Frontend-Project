import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { ExpertProfile } from '../../../shared/models/user.model';
import { ExpertEarnings, ExpertPayout } from '../../../shared/models/expert.model';
import { Booking } from '../../../shared/models/booking.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.scss']
})
export class EarningsComponent implements OnInit {
  private API_URL = 'http://localhost:3000';

  expertProfile: ExpertProfile | null = null;
  earnings: ExpertEarnings | null = null;
  payouts: ExpertPayout[] = [];
  recentBookings: any[] = [];
  isLoading = true;

  todayEarnings = 0;
  weekEarnings = 0;
  monthEarnings = 0;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEarningsData();
  }

  loadEarningsData(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/expert/login']);
      return;
    }

    this.http.get<ExpertProfile[]>(`${this.API_URL}/expertProfiles?userId=${user.id}`).subscribe({
      next: (profiles) => {
        if (profiles.length > 0) {
          this.expertProfile = profiles[0];
          this.loadExpertEarnings(profiles[0].id);
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

  loadExpertEarnings(expertId: string): void {
    forkJoin({
      earnings: this.http.get<ExpertEarnings[]>(`${this.API_URL}/expertEarnings?expertId=${expertId}`),
      payouts: this.http.get<ExpertPayout[]>(`${this.API_URL}/expertPayouts?expertId=${expertId}`),
      bookings: this.http.get<Booking[]>(`${this.API_URL}/bookings?expertId=${expertId}&status=COMPLETED`)
    }).subscribe({
      next: (data) => {
        if (data.earnings.length > 0) {
          this.earnings = data.earnings[0];
        } else {
          this.earnings = {
            id: `earnings-${expertId}`,
            expertId: expertId,
            totalEarned: 0,
            totalEarnings: 0,
            currency: 'INR',
            completedJobs: 0,
            pendingAmount: 0,
            paidAmount: 0,
            lastUpdated: new Date().toISOString()
          };
        }

        this.payouts = data.payouts.sort((a, b) => {
          const dateA = a.processedAt ? new Date(a.processedAt).getTime() : 0;
          const dateB = b.processedAt ? new Date(b.processedAt).getTime() : 0;
          return dateB - dateA;
        });

        // Calculate earnings from bookings if earnings record is not reliable or for demo
        this.calculateEarnings(data.bookings);

        // Update total earnings from calculated data if 0
        if (this.earnings && this.earnings.totalEarned === 0) {
          const total = data.bookings.reduce((sum, b) => sum + b.quotedAmount, 0);
          this.earnings.totalEarned = total;
          this.earnings.totalEarnings = total;

          const totalPaid = this.payouts
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + p.amount, 0);

          this.earnings.pendingAmount = total - totalPaid;
          this.earnings.paidAmount = totalPaid;
          this.earnings.completedJobs = data.bookings.length;
        }

        // Fetch service names for recent bookings
        const recent = data.bookings.slice(0, 10);
        if (recent.length > 0) {
          const requests = recent.map(b => this.http.get<any>(`${this.API_URL}/services/${b.serviceId}`));
          forkJoin(requests).subscribe(services => {
            this.recentBookings = recent.map((b, i) => ({
              ...b,
              serviceName: services[i].name
            }));
            this.isLoading = false;
          });
        } else {
          this.recentBookings = [];
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading earnings:', error);
        this.isLoading = false;
      }
    });
  }

  calculateEarnings(bookings: Booking[]): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.todayEarnings = bookings
      .filter(b => new Date(b.completedAt || b.updatedAt || '') >= today)
      .reduce((sum, b) => sum + b.quotedAmount, 0);

    this.weekEarnings = bookings
      .filter(b => new Date(b.completedAt || b.updatedAt || '') >= weekAgo)
      .reduce((sum, b) => sum + b.quotedAmount, 0);

    this.monthEarnings = bookings
      .filter(b => new Date(b.completedAt || b.updatedAt || '') >= monthAgo)
      .reduce((sum, b) => sum + b.quotedAmount, 0);
  }

  requestPayout(): void {
    if (!this.earnings || this.earnings.pendingAmount < 500) {
      alert('Minimum payout amount is ₹500');
      return;
    }

    if (confirm(`Request payout of ₹${this.earnings.pendingAmount}?`)) {
      alert('Payout request submitted! You will receive payment within 2-3 business days.');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
