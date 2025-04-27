// payment.model.ts
export interface Payment {
  paymentId: number;
  paymentType: number;
  transactionId?: string;
  amount: number;
  status: number;
  receiptUrl: string;
  createdAt: string;
  updatedAt: string;
  orderId?: number;
}

export enum PaymentMethod {
  CreditCard = 1,
  PayPal = 2,
  BankTransfer = 3,
  cashfree = 4
}

export enum PaymentStatus {
  Pending = 1,
  Completed = 2,
  Failed = 3,
  Refunded = 4
}

export interface PaymentRequest {
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDetails: any;
}

export interface PaymentResponse {
  success?: boolean;
  paymentId?: number;
  error?: string;
  redirectUrl?: string;
}