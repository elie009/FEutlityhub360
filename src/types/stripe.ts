export interface StripeCustomer {
  customerId: string;
  email?: string;
  name?: string;
}

export interface StripePaymentMethod {
  paymentMethodId: string;
  type?: string;
  cardLast4?: string;
  cardBrand?: string;
}

export interface StripeSubscription {
  subscriptionId: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  clientSecret?: string;
}

export interface StripePaymentIntent {
  paymentIntentId: string;
  clientSecret?: string;
  status: string;
  amount: number;
  currency: string;
}

export interface CreateSubscriptionPaymentRequest {
  planId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  paymentMethodId: string;
}

export interface UpdatePaymentMethodRequest {
  paymentMethodId: string;
}

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface CreateCheckoutSessionRequest {
  planId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
}

export interface VerifyCheckoutSessionRequest {
  sessionId: string;
}

