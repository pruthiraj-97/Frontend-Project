import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Zone } from '../../../shared/models/booking.model';
import { Category } from '../../../shared/models/service.model';

@Component({
  selector: 'app-expert-registration-wizard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './expert-registration-wizard.component.html',
  styleUrls: ['./expert-registration-wizard.component.scss']
})
export class ExpertRegistrationWizardComponent implements OnInit {
  private API_URL = 'http://localhost:3000';

  currentStep = 1;
  totalSteps = 4;

  personalInfoForm: FormGroup;
  serviceProfileForm: FormGroup;
  idVerificationForm: FormGroup;
  bankDetailsForm: FormGroup;

  availableSkills: string[] = [];
  availableZones: Zone[] = [];
  selectedSkills: string[] = [];
  selectedZones: string[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.personalInfoForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      dateOfBirth: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

    this.serviceProfileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      experience: ['', [Validators.required, Validators.min(0)]]
    }, { validators: this.passwordMatchValidator });

    this.idVerificationForm = this.fb.group({
      idType: ['', Validators.required],
      idNumber: ['', Validators.required]
    });

    this.bankDetailsForm = this.fb.group({
      accountNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{9,18}$/)]],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      accountHolderName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSkillsAndZones();
  }

  loadSkillsAndZones(): void {
    this.http.get<Category[]>(`${this.API_URL}/categories?isActive=true`).subscribe({
      next: (categories) => {
        this.availableSkills = categories.map(c => c.name);
      }
    });

    this.http.get<Zone[]>(`${this.API_URL}/zones?isActive=true`).subscribe({
      next: (zones) => {
        this.availableZones = zones;
      }
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  toggleSkill(skill: string): void {
    const index = this.selectedSkills.indexOf(skill);
    if (index > -1) {
      this.selectedSkills.splice(index, 1);
    } else {
      this.selectedSkills.push(skill);
    }
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedSkills.includes(skill);
  }

  toggleZone(zoneId: string): void {
    const index = this.selectedZones.indexOf(zoneId);
    if (index > -1) {
      this.selectedZones.splice(index, 1);
    } else {
      this.selectedZones.push(zoneId);
    }
  }

  isZoneSelected(zoneId: string): boolean {
    return this.selectedZones.includes(zoneId);
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.personalInfoForm.invalid) {
      this.markFormGroupTouched(this.personalInfoForm);
      return;
    }
    if (this.currentStep === 2) {
      if (this.serviceProfileForm.invalid || this.selectedSkills.length === 0 || this.selectedZones.length === 0) {
        this.markFormGroupTouched(this.serviceProfileForm);
        if (this.selectedSkills.length === 0) alert('Please select at least one skill');
        if (this.selectedZones.length === 0) alert('Please select at least one zone');
        return;
      }
    }
    if (this.currentStep === 3 && this.idVerificationForm.invalid) {
      this.markFormGroupTouched(this.idVerificationForm);
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  submitRegistration(): void {
    if (this.bankDetailsForm.invalid) {
      this.markFormGroupTouched(this.bankDetailsForm);
      return;
    }

    const userId = this.generateId();
    const registrationData = {
      ...this.personalInfoForm.value,
      ...this.serviceProfileForm.value,
      ...this.idVerificationForm.value,
      ...this.bankDetailsForm.value
    };

    delete registrationData.confirmPassword;

    // Create user
    this.http.post(`${this.API_URL}/users`, {
      id: userId,
      phone: '+91' + registrationData.mobileNumber,
      email: registrationData.email,
      fullName: registrationData.fullName,
      password: registrationData.password,
      roles: ['ROLE_EXPERT'],
      blocked: false,
      createdAt: new Date().toISOString()
    }).subscribe({
      next: () => {
        // Create expert profile
        this.http.post(`${this.API_URL}/expertProfiles`, {
          id: userId,
          userId: userId,
          fullName: registrationData.fullName,
          phone: '+91' + registrationData.mobileNumber,
          skills: this.selectedSkills,
          zoneIds: this.selectedZones,
          status: 'PENDING',
          onlineStatus: 'OFFLINE',
          rating: 0,
          totalJobs: 0,
          createdAt: new Date().toISOString()
        }).subscribe({
          next: () => {
            alert('Registration successful! Your profile is pending approval. You will be notified once approved.');
            this.router.navigate(['/expert/login']);
          },
          error: (error) => {
            console.error('Error creating expert profile:', error);
            alert('Registration failed. Please try again.');
          }
        });
      },
      error: (error) => {
        console.error('Error creating user:', error);
        alert('Registration failed. Please try again.');
      }
    });
  }

  generateId(): string {
    return 'expert-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

