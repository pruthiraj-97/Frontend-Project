import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Booking } from '../../../shared/models/booking.model';
import { Rating } from '../../../shared/models/payment.model';
import { AuthService } from '../../../core/auth/auth.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-rate-service',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './rate-service.component.html',
    styleUrls: ['./rate-service.component.scss']
})
export class RateServiceComponent implements OnInit {
    private API_URL = 'http://localhost:3000';

    booking: Booking | null = null;
    serviceName: string = '';
    expertName: string = '';

    ratingForm: FormGroup;
    isLoading = true;
    submitted = false;
    hoveredStar = 0;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.ratingForm = this.fb.group({
            stars: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
            comment: ['', [Validators.required, Validators.minLength(10)]]
        });
    }

    ngOnInit(): void {
        const bookingId = this.route.snapshot.paramMap.get('id');
        if (bookingId) {
            this.loadBooking(bookingId);
        } else {
            this.router.navigate(['/customer/bookings']);
        }
    }

    loadBooking(id: string): void {
        this.http.get<Booking>(`${this.API_URL}/bookings/${id}`).subscribe({
            next: (booking) => {
                if (booking.status !== 'COMPLETED') {
                    alert('You can only rate completed bookings.');
                    this.router.navigate(['/customer/bookings']);
                    return;
                }
                this.booking = booking;

                // Fetch Service and Expert details
                const serviceReq = this.http.get<any>(`${this.API_URL}/services/${booking.serviceId}`);
                const expertReq = booking.expertId ? this.http.get<any>(`${this.API_URL}/users/${booking.expertId}`) : null;

                if (expertReq) {
                    forkJoin({ service: serviceReq, expert: expertReq }).subscribe({
                        next: (data) => {
                            this.serviceName = data.service.name;
                            this.expertName = data.expert.name;
                            this.checkExistingRating(id);
                        }
                    });
                } else {
                    serviceReq.subscribe((service: any) => {
                        this.serviceName = service.name;
                        this.checkExistingRating(id);
                    });
                }
            },
            error: () => {
                alert('Booking not found');
                this.router.navigate(['/customer/bookings']);
            }
        });
    }

    checkExistingRating(bookingId: string): void {
        this.http.get<Rating[]>(`${this.API_URL}/ratings?bookingId=${bookingId}`).subscribe({
            next: (ratings) => {
                if (ratings.length > 0) {
                    alert('You have already rated this service.');
                    this.router.navigate(['/customer/bookings', bookingId]);
                }
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    setRating(stars: number): void {
        this.ratingForm.patchValue({ stars });
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.ratingForm.invalid || !this.booking) return;

        const user = this.authService.getCurrentUser();
        if (!user) return;

        const ratingData: Rating = {
            id: `rating-${Date.now()}`,
            bookingId: this.booking.id,
            customerId: user.id,
            expertId: this.booking.expertId!,
            stars: this.ratingForm.value.stars,
            comment: this.ratingForm.value.comment,
            createdAt: new Date().toISOString()
        };

        this.http.post(`${this.API_URL}/ratings`, ratingData).subscribe({
            next: () => {
                // Also update expert's average rating (mock logic - would be backend usually)
                this.updateExpertRating(this.booking!.expertId!, ratingData.stars);
            },
            error: () => {
                alert('Failed to submit rating');
            }
        });
    }

    updateExpertRating(expertId: string, newStars: number): void {
        // This is a simplified frontend updates for the mock backend
        // In reality, backend handles this aggregation
        this.http.get<any>(`${this.API_URL}/expertProfiles?userId=${expertId}`).subscribe(profiles => {
            if (profiles.length > 0) {
                const profile = profiles[0];
                // Handle case where rating might be undefined or 0
                const currentRating = profile.rating || 0;
                const currentTotalJobs = profile.totalJobs || 0;

                const currentTotal = currentRating * currentTotalJobs;
                const newTotalJobs = currentTotalJobs + 1;
                const newRating = (currentTotal + newStars) / newTotalJobs;

                this.http.patch(`${this.API_URL}/expertProfiles/${profile.id}`, {
                    rating: newRating,
                    totalJobs: newTotalJobs
                }).subscribe(() => {
                    alert('Thank you for your feedback!');
                    this.router.navigate(['/customer/bookings', this.booking?.id]);
                });
            } else {
                alert('Thank you for your feedback!');
                this.router.navigate(['/customer/bookings', this.booking?.id]);
            }
        });
    }

    get f() { return this.ratingForm.controls; }
}
