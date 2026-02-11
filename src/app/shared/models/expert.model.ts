export interface ExpertProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  profilePictureUrl: string;
  bio: string;
  serviceIds: string[];
  zoneIds: string[];
  rating: number;
  totalReviews: number;
  totalJobs: number;
  isAvailable: boolean;
  isVerified: boolean;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  idProofUrl: string;
  photoUrl: string;
  createdAt: string;
}

export interface ExpertEarnings {
  id: string;
  expertId: string;
  totalEarnings: number;
  totalEarned: number;
  pendingAmount: number;
  paidAmount: number;
  completedJobs: number;
  currency: string;
  lastUpdated: string;
}

export interface ExpertPayout {
  id: string;
  expertId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  paymentMethod: string;
  method: string;
  transactionId: string | null;
  requestedAt: string;
  processedAt: string | null;
}

export interface ExpertJob {
  id: string;
  bookingId: string;
  expertId: string;
  status: 'OFFERED' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED';
  offeredAt: string;
  respondedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

