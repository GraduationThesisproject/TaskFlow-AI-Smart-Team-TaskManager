/**
 * Subscription service for mobile app
 * Handles payment processing and subscription management
 */

import { axiosInstance } from '@/config/axios';

export interface SubscriptionPlan {
  key: string;
  name: string;
  monthlyPrice: number;
  desc: string;
  cta: string;
  ctaVariant: 'default' | 'secondary' | 'accent';
  highlighted: boolean;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface PaymentBody {
  products: Array<{
    price_data: {
      currency: string;
      product_data: {
        name: string;
        description: string;
      };
      unit_amount: number;
    };
    quantity: number;
  }>;
  metadata: {
    plan: string;
    billing_cycle: string;
    original_price: number;
    final_price: number;
  };
}

export class SubscriptionService {
  /**
   * Create a checkout session for payment processing
   */
  static async createCheckoutSession(body: PaymentBody): Promise<CheckoutSession> {
    try {
      const response = await axiosInstance.post('/checkout/create-checkout-session', body, {
        timeout: 30000,
        validateStatus: (status) => status < 500,
      });

      if (!response.data?.id) {
        throw new Error('Invalid checkout session response');
      }

      return response.data;
    } catch (error: any) {
      console.error('Failed to create checkout session:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to create checkout session');
    }
  }

  /**
   * Send payment confirmation notification
   */
  static async sendPaymentConfirmation(data: {
    sessionId: string;
    planName: string;
    amount: number;
    billingCycle: string;
  }) {
    try {
      const response = await axiosInstance.post('/checkout/send-payment-notification', data, {
        timeout: 30000,
        validateStatus: (status) => status < 500,
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to send payment confirmation:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to send payment confirmation');
    }
  }

  /**
   * Get subscription plans with pricing
   */
  static getSubscriptionPlans(billingCycle: 'monthly' | 'annually' = 'monthly'): SubscriptionPlan[] {
    const basePlans: SubscriptionPlan[] = [
      {
        key: "free",
        name: "Free",
        monthlyPrice: 0,
        desc: "For individuals or small teams looking to keep work organized.",
        cta: "Current",
        ctaVariant: "secondary",
        highlighted: false,
      },
      {
        key: "standard",
        name: "Standard",
        monthlyPrice: 5,
        desc: "Get more done with unlimited boards, card mirroring, and more automation.",
        cta: "Upgrade",
        ctaVariant: "default",
        highlighted: false,
      },
      {
        key: "premium",
        name: "Premium",
        monthlyPrice: 10,
        desc: "Add AI to your boards and admin controls to your toolkit. Plus, get more perspective with views.",
        cta: "Upgrade",
        ctaVariant: "default",
        highlighted: true,
      },
      {
        key: "enterprise",
        name: "Enterprise",
        monthlyPrice: 17.5,
        desc: "Add enterprise‑grade security and controls to your toolkit.",
        cta: "Contact Sales",
        ctaVariant: "accent",
        highlighted: false,
      },
    ];

    return basePlans;
  }

  /**
   * Calculate price based on billing cycle
   */
  static calculatePrice(monthlyPrice: number, billingCycle: 'monthly' | 'annually'): number {
    if (billingCycle === 'annually') {
      const annualPrice = monthlyPrice * 12 * 0.83; // 17% discount
      return annualPrice;
    }
    return monthlyPrice;
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number): string {
    if (price === 0) return '$0 USD';
    return `$${price.toFixed(2)} USD`;
  }

  /**
   * Get period text for display
   */
  static getPeriodText(planKey: string, billingCycle: 'monthly' | 'annually'): string {
    if (planKey === 'free') return '';
    if (billingCycle === 'monthly') {
      return 'per user/month';
    } else {
      return 'per user/year (billed annually)';
    }
  }

  /**
   * Get annual savings text
   */
  static getAnnualSavings(monthlyPrice: number, billingCycle: 'monthly' | 'annually'): string | null {
    if (billingCycle === 'annually' && monthlyPrice > 0) {
      return `Save $${(monthlyPrice * 12 * 0.17).toFixed(2)}/year`;
    }
    return null;
  }

  /**
   * Generate payment body for checkout
   */
  static generatePaymentBody(plan: SubscriptionPlan, billingCycle: 'monthly' | 'annually'): PaymentBody {
    const price = this.calculatePrice(plan.monthlyPrice, billingCycle);
    const priceInCents = Math.round(price * 100);

    return {
      products: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${plan.name} Plan`,
            description: plan.desc,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      }],
      metadata: {
        plan: plan.name,
        billing_cycle: billingCycle,
        original_price: plan.monthlyPrice,
        final_price: price,
      }
    };
  }
}
