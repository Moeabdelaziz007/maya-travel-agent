// Payment Service for Maya Trips
export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'paypal' | 'telegram';
  description: string;
  chatId?: string;
}

export interface PaymentResponse {
  success: boolean;
  payment?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    description: string;
    created_at: string;
  };
  error?: string;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export class PaymentService {
  private static baseURL = '/api/payment';

  // Create a new payment
  static async createPayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseURL}/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Confirm a payment
  static async confirmPayment(
    paymentId: string,
    paymentMethod: string
  ): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseURL}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          paymentMethod,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Get payment status
  static async getPaymentStatus(
    paymentId: string
  ): Promise<{ success: boolean; payment?: PaymentStatus; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseURL}/payment-status/${paymentId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Telegram Bot payment integration
  static async createTelegramPayment(
    amount: number,
    description: string,
    chatId: string
  ): Promise<PaymentResponse> {
    return this.createPayment({
      amount,
      currency: 'USD',
      paymentMethod: 'telegram',
      description,
      chatId,
    });
  }

  // Stripe payment integration with payment links
  static async createStripePaymentLink(
    amount: number,
    description: string,
    customerEmail?: string
  ): Promise<{
    success: boolean;
    paymentLink?: {
      id: string;
      url: string;
      amount: number;
      currency: string;
      description: string;
      status: string;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/create-payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'USD',
          description,
          customerEmail,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Stripe payment integration
  static async createStripePayment(
    amount: number,
    description: string
  ): Promise<PaymentResponse> {
    return this.createPayment({
      amount,
      currency: 'USD',
      paymentMethod: 'stripe',
      description,
    });
  }

  // PayPal payment integration
  static async createPayPalPayment(
    amount: number,
    description: string
  ): Promise<PaymentResponse> {
    return this.createPayment({
      amount,
      currency: 'USD',
      paymentMethod: 'paypal',
      description,
    });
  }

  // Format amount for display
  static formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Validate payment amount
  static validateAmount(amount: number): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }
    if (amount > 10000) {
      return { valid: false, error: 'Amount cannot exceed $10,000' };
    }
    return { valid: true };
  }

  // Get supported payment methods
  static getSupportedMethods(): Array<{
    id: string;
    name: string;
    description: string;
    available: boolean;
  }> {
    return [
      {
        id: 'stripe',
        name: 'Credit Card',
        description: 'Pay with Visa, Mastercard, or American Express',
        available: true,
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        available: true,
      },
      {
        id: 'telegram',
        name: 'Telegram',
        description: 'Pay through Telegram Bot',
        available: true,
      },
    ];
  }
}
