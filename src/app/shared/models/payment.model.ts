export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId: string;
  receiptId: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED';
export type PaymentMethod = 'UPI' | 'CARD' | 'CASH';

export interface Receipt {
  id: string;
  bookingId: string;
  paymentId: string;
  amount: number;
  currency: string;
  serviceName: string;
  customerName: string;
  expertName: string;
  issuedAt: string;
  breakdown: ReceiptBreakdown[];
}

export interface ReceiptBreakdown {
  label: string;
  amount: number;
}

export interface Rating {
  id: string;
  bookingId: string;
  customerId: string;
  expertId: string;
  stars: number;
  comment: string;
  createdAt: string;
}

