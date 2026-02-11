export interface Booking {
  id: string;
  customerId: string;
  expertId: string | null;
  zoneId: string;
  serviceId: string;
  addressId: string;
  status: BookingStatus;
  bookingType: 'ASAP' | 'SCHEDULED';
  durationMinutes: number;
  addonIds: string[];
  quotedAmount: number;
  currency: string;
  etaMinutes: number | null;
  scheduledStartTime: string | null;
  scheduledDate?: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  completedAt?: string | null;
  notes: string;
  otp: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED';

export interface CreateBookingRequest {
  serviceId: string;
  addressId: string;
  bookingType: 'ASAP' | 'SCHEDULED';
  scheduledStartTime?: string;
  addonIds: string[];
  notes?: string;
}

export interface Address {
  id: string;
  customerId: string;
  label: string;
  type?: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  pincode?: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface Zone {
  id: string;
  name: string;
  city: string;
  state: string;
  isActive: boolean;
}

