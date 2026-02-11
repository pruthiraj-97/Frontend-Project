import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { ExpertProfile } from '../../../shared/models/user.model';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {
  private API_URL = 'http://localhost:3000';

  expertProfile: ExpertProfile | null = null;
  isLoading = true;

  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  workingHours: any = {
    Monday: { enabled: true, start: '09:00', end: '18:00' },
    Tuesday: { enabled: true, start: '09:00', end: '18:00' },
    Wednesday: { enabled: true, start: '09:00', end: '18:00' },
    Thursday: { enabled: true, start: '09:00', end: '18:00' },
    Friday: { enabled: true, start: '09:00', end: '18:00' },
    Saturday: { enabled: true, start: '10:00', end: '16:00' },
    Sunday: { enabled: false, start: '10:00', end: '16:00' }
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExpertProfile();
  }

  loadExpertProfile(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/expert/login']);
      return;
    }

    this.http.get<ExpertProfile[]>(`${this.API_URL}/expertProfiles?userId=${user.id}`).subscribe({
      next: (profiles) => {
        if (profiles.length > 0) {
          this.expertProfile = profiles[0];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expert profile:', error);
        this.isLoading = false;
      }
    });
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
        alert(`You are now ${newStatus}`);
      },
      error: (error) => {
        console.error('Error updating availability:', error);
        alert('Failed to update availability');
      }
    });
  }

  toggleDayEnabled(day: string): void {
    this.workingHours[day].enabled = !this.workingHours[day].enabled;
  }

  saveWorkingHours(): void {
    alert('Working hours saved successfully!');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

