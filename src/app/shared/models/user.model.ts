export interface User {
  id: string;
  phone: string;
  email: string;
  fullName: string;
  password?: string;
  roles: string[];
  blocked: boolean;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  preferredZoneIds: string[];
}

export interface ExpertProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  skills: string[];
  zoneIds: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  onlineStatus: 'ONLINE' | 'OFFLINE';
  rating: number;
  totalJobs: number;
  createdAt: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterCustomerRequest {
  fullName: string;
  age: number;
  address: string;
  phone: string;
  email: string;
  password: string;
}

export interface RegisterExpertRequest {
  fullName: string;
  age: number;
  address: string;
  phone: string;
  email: string;
  password: string;
  skills: string[];
  zoneIds: string[];
  idType: string;
  idNumber: string;
}

