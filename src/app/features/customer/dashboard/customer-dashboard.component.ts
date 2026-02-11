import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { Category } from '../../../shared/models/service.model';
import { Booking } from '../../../shared/models/booking.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  private readonly API_URL = 'http://localhost:3000';
  
  customerName = '';
  categories: Category[] = [];
  recentBookings: Booking[] = [];
  isLoading = true;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.customerName = user?.fullName || 'Customer';
    
    this.loadCategories();
    this.loadRecentBookings();
  }

  loadCategories(): void {
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

  loadRecentBookings(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.http.get<Booking[]>(`${this.API_URL}/bookings?customerId=${user.id}&_sort=createdAt&_order=desc&_limit=3`).subscribe({
        next: (bookings) => {
          this.recentBookings = bookings;
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
        }
      });
    }
  }

  navigateToBookService(categoryId?: string): void {
    if (categoryId) {
      this.router.navigate(['/customer/book-service'], { queryParams: { category: categoryId } });
    } else {
      this.router.navigate(['/customer/book-service']);
    }
  }

  navigateToBookings(): void {
    this.router.navigate(['/customer/bookings']);
  }

  navigateToAddresses(): void {
    this.router.navigate(['/customer/addresses']);
  }

  logout(): void {
    this.authService.logout();
  }
}

