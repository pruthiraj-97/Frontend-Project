import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'customer/register',
    loadComponent: () => import('./features/customer/registration/customer-registration.component').then(m => m.CustomerRegistrationComponent)
  },
  {
    path: 'customer/login',
    loadComponent: () => import('./features/customer/login/customer-login.component').then(m => m.CustomerLoginComponent)
  },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard],
    data: { role: 'ROLE_CUSTOMER' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/customer/dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent)
      },
      {
        path: 'book-service',
        loadComponent: () => import('./features/customer/book-service/book-service.component').then(m => m.BookServiceComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/customer/booking-history/booking-history.component').then(m => m.BookingHistoryComponent)
      },
      {
        path: 'bookings/:id',
        loadComponent: () => import('./features/customer/booking-details/booking-details.component').then(m => m.BookingDetailsComponent)
      },
      {
        path: 'bookings/:id/rate',
        loadComponent: () => import('./features/customer/rate-service/rate-service.component').then(m => m.RateServiceComponent)
      },
      {
        path: 'bookings/:id/modify',
        loadComponent: () => import('./features/customer/modify-booking/modify-booking.component').then(m => m.ModifyBookingComponent)
      },
      {
        path: 'addresses',
        loadComponent: () => import('./features/customer/address-management/address-management.component').then(m => m.AddressManagementComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'expert/register',
    loadComponent: () => import('./features/expert/registration-wizard/expert-registration-wizard.component').then(m => m.ExpertRegistrationWizardComponent)
  },
  {
    path: 'expert/login',
    loadComponent: () => import('./features/expert/login/expert-login.component').then(m => m.ExpertLoginComponent)
  },
  {
    path: 'expert',
    canActivate: [authGuard, roleGuard],
    data: { role: 'ROLE_EXPERT' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/expert/dashboard/expert-dashboard.component').then(m => m.ExpertDashboardComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/expert/job-offers/job-offers.component').then(m => m.JobOffersComponent)
      },
      {
        path: 'jobs/:id',
        loadComponent: () => import('./features/expert/job-details/job-details.component').then(m => m.JobDetailsComponent)
      },
      {
        path: 'availability',
        loadComponent: () => import('./features/expert/availability/availability.component').then(m => m.AvailabilityComponent)
      },
      {
        path: 'earnings',
        loadComponent: () => import('./features/expert/earnings/earnings.component').then(m => m.EarningsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

