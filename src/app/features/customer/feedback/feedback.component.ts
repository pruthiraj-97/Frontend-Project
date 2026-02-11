import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { Booking } from '../../../shared/models/booking.model';
import { Rating } from '../../../shared/models/rating.model';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  private API_URL = 'http://localhost:3000';
  
  booking: Booking | null = null;
  isLoading = true;
  
  rating = 0;
  serviceRating = 0;
  expertRating = 0;
  review = '';
  
  stars = [1, 2, 3, 4, 5];
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.isLoading = false;
      }
    });
  }
  
  setRating(value: number): void {
    this.rating = value;
  }
  
  setServiceRating(value: number): void {
    this.serviceRating = value;
  }
  
  setExpertRating(value: number): void {
    this.expertRating = value;
  }
  
  submitFeedback(): void {
    if (!this.booking || this.rating === 0) {
      alert('Please provide a rating');
      return;
    }
    
    const user = this.authService.getCurrentUser();
    if (!user) return;
    
    const ratingData: Rating = {
      id: `R${Date.now()}`,
      bookingId: this.booking.id,
      customerId: user.id,
      expertId: this.booking.expertId || '',
      serviceId: this.booking.serviceId,
      rating: this.rating,
      serviceRating: this.serviceRating || this.rating,
      expertRating: this.expertRating || this.rating,
      review: this.review,
      createdAt: new Date().toISOString()
    };
    
    this.http.post(`${this.API_URL}/ratings`, ratingData).subscribe({
      next: () => {
        // Update booking with rating
        this.http.patch(`${this.API_URL}/bookings/${this.booking!.id}`, {
          ratingId: ratingData.id
        }).subscribe({
          next: () => {
            alert('Thank you for your feedback!');
            this.router.navigate(['/customer/bookings']);
          }
        });
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback');
      }
    });
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

