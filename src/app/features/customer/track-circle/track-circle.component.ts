import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { Booking } from '../../../shared/models/booking.model';
import { Service } from '../../../shared/models/service.model';
import { ExpertProfile } from '../../../shared/models/user.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-track-circle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './track-circle.component.html',
  styleUrls: ['./track-circle.component.scss']
})
export class TrackCircleComponent implements OnInit {
  private API_URL = 'http://localhost:3000';
  
  booking: Booking | null = null;
  service: Service | null = null;
  expert: ExpertProfile | null = null;
  address: any = null;
  isLoading = true;
  
  expertLocation = { lat: 28.6139, lng: 77.2090 }; // Mock location (Delhi)
  customerLocation = { lat: 28.7041, lng: 77.1025 }; // Mock location
  estimatedTime = 15; // minutes
  distance = 3.5; // km
  
  trackingSteps = [
    { label: 'Booking Confirmed', completed: true, time: '10:00 AM' },
    { label: 'Expert Assigned', completed: true, time: '10:05 AM' },
    { label: 'Expert On The Way', completed: true, time: '10:15 AM' },
    { label: 'Expert Arrived', completed: false, time: 'ETA 10:30 AM' },
    { label: 'Service Started', completed: false, time: '-' },
    { label: 'Service Completed', completed: false, time: '-' }
  ];
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.loadBookingDetails(bookingId);
      this.startLocationTracking();
    }
  }
  
  loadBookingDetails(bookingId: string): void {
    this.http.get<Booking>(`${this.API_URL}/bookings/${bookingId}`).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.loadRelatedData(booking);
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.isLoading = false;
      }
    });
  }
  
  loadRelatedData(booking: Booking): void {
    forkJoin({
      service: this.http.get<Service>(`${this.API_URL}/services/${booking.serviceId}`),
      address: this.http.get<any>(`${this.API_URL}/addresses/${booking.addressId}`),
      expert: booking.expertId ? 
        this.http.get<ExpertProfile[]>(`${this.API_URL}/expertProfiles?userId=${booking.expertId}`) : 
        Promise.resolve([])
    }).subscribe({
      next: (data) => {
        this.service = data.service;
        this.address = data.address;
        this.expert = Array.isArray(data.expert) && data.expert.length > 0 ? data.expert[0] : null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading related data:', error);
        this.isLoading = false;
      }
    });
  }
  
  startLocationTracking(): void {
    // Simulate real-time location updates
    setInterval(() => {
      // Mock location update - in real app, this would come from WebSocket or API
      this.estimatedTime = Math.max(0, this.estimatedTime - 1);
      if (this.estimatedTime === 0) {
        this.trackingSteps[3].completed = true;
      }
    }, 60000); // Update every minute
  }
  
  callExpert(): void {
    if (this.expert) {
      alert(`Calling ${this.expert.fullName}...`);
    }
  }
  
  shareLocation(): void {
    alert('Location shared with expert');
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

