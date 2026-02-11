import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-customer-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './customer-registration.component.html',
  styleUrls: ['./customer-registration.component.scss']
})
export class CustomerRegistrationComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  currentStep = 1;
  totalSteps = 3;
  
  // Step 1: Personal Information
  personalInfoForm: FormGroup;
  
  // Step 2: Service Profile
  serviceProfileForm: FormGroup;
  
  // Step 3: ID Verification
  idVerificationForm: FormGroup;
  
  private readonly API_URL = 'http://localhost:3000';

  constructor() {
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
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.idVerificationForm = this.fb.group({
      idType: ['', Validators.required],
      idNumber: ['', Validators.required]
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.personalInfoForm.valid) {
      this.currentStep++;
    } else if (this.currentStep === 2 && this.serviceProfileForm.valid) {
      this.currentStep++;
    } else if (this.currentStep === 3 && this.idVerificationForm.valid) {
      this.submitRegistration();
    } else {
      this.markFormGroupTouched(this.getCurrentForm());
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getCurrentForm(): FormGroup {
    switch (this.currentStep) {
      case 1: return this.personalInfoForm;
      case 2: return this.serviceProfileForm;
      case 3: return this.idVerificationForm;
      default: return this.personalInfoForm;
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  submitRegistration(): void {
    const registrationData = {
      ...this.personalInfoForm.value,
      ...this.serviceProfileForm.value,
      ...this.idVerificationForm.value,
      roles: ['ROLE_CUSTOMER'],
      blocked: false,
      createdAt: new Date().toISOString()
    };

    // Remove confirmPassword
    delete registrationData.confirmPassword;

    // Create user
    this.http.post(`${this.API_URL}/users`, {
      id: this.generateId(),
      phone: '+91' + registrationData.mobileNumber,
      email: registrationData.email,
      fullName: registrationData.fullName,
      password: registrationData.password,
      roles: ['ROLE_CUSTOMER'],
      blocked: false,
      createdAt: registrationData.createdAt
    }).subscribe({
      next: (user: any) => {
        // Create customer profile
        this.http.post(`${this.API_URL}/customerProfiles`, {
          id: user.id,
          userId: user.id,
          fullName: registrationData.fullName,
          phone: '+91' + registrationData.mobileNumber,
          email: registrationData.email,
          preferredZoneIds: []
        }).subscribe({
          next: () => {
            alert('Registration successful! Please login.');
            this.router.navigate(['/customer/login']);
          },
          error: (error) => {
            console.error('Error creating profile:', error);
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

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  backToHome(): void {
    this.router.navigate(['/']);
  }
}

