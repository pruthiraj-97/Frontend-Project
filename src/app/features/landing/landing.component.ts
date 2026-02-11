import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  selectedService = 'Cleaning';
  
  services = ['Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Painting'];
  
  features = [
    {
      title: 'Verified Experts',
      description: 'All our service providers are background-verified and trained professionals',
      icon: 'verified_user'
    },
    {
      title: 'Fast Service',
      description: 'Book ASAP for immediate service or schedule up to 4 days in advance',
      icon: 'flash_on'
    },
    {
      title: 'Quality Assurance',
      description: 'OTP-verified service start and customer ratings ensure quality',
      icon: 'star'
    },
    {
      title: 'Expert Support',
      description: 'Dedicated support for both customers and service experts',
      icon: 'support_agent'
    }
  ];

  constructor(private router: Router) {}

  selectService(service: string): void {
    this.selectedService = service;
  }

  navigateToBookService(): void {
    this.router.navigate(['/customer/register']);
  }

  navigateToBecomeExpert(): void {
    this.router.navigate(['/expert/register']);
  }

  scrollToFeatures(): void {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}

