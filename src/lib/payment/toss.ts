// Toss Payments API types
export interface ConfirmPaymentParams {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface CancelParams {
  cancelReason: string;
  cancelAmount?: number;
}

export interface TossPayment {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  totalAmount: number;
  method: string;
  receipt: { url: string } | null;
  approvedAt: string;
  cancels?: TossCancel[];
}

export interface TossCancel {
  cancelAmount: number;
  cancelReason: string;
  canceledAt: string;
}

export class TossPaymentError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'TossPaymentError';
  }
}

const TOSS_API_URL = 'https://api.tosspayments.com/v1';

export class TossClient {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  private get authHeader(): string {
    return `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${TOSS_API_URL}${path}`, {
      method,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new TossPaymentError(error.code, error.message);
    }

    return response.json();
  }

  async confirmPayment(params: ConfirmPaymentParams): Promise<TossPayment> {
    return this.request<TossPayment>('POST', '/payments/confirm', params);
  }

  async cancelPayment(paymentKey: string, params: CancelParams): Promise<TossPayment> {
    return this.request<TossPayment>('POST', `/payments/${paymentKey}/cancel`, params);
  }
}

export const tossClient = new TossClient(process.env.TOSS_SECRET_KEY || '');

// Convenience functions
export async function confirmOneTimePayment(params: ConfirmPaymentParams): Promise<TossPayment> {
  return tossClient.confirmPayment(params);
}

export async function refundPayment(paymentKey: string, params: CancelParams): Promise<TossPayment> {
  return tossClient.cancelPayment(paymentKey, params);
}
