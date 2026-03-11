// Payment types

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'partial_refunded';
export type PaymentMethod = 'card' | 'virtual_account' | 'transfer' | 'mobile';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  intervalCount: number;
  features: string[] | null;
  isActive: boolean;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
}

export interface Payment {
  id: string;
  userId: string;
  planId: string | null;
  orderId: string;
  paymentKey: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod | null;
  receiptUrl: string | null;
  failReason: string | null;
  cancelReason: string | null;
  cancelAmount: number | null;
  paidAt: Date | null;
  cancelledAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  planId?: string;
  amount: number;
  orderName: string;
  metadata?: Record<string, unknown>;
}

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  orderName: string;
}

export interface ConfirmPaymentInput {
  orderId: string;
  paymentKey: string;
  amount: number;
}

export interface CancelPaymentInput {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
}

export class PaymentError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}
