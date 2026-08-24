/**
 * Checkout payment session mapping.
 * Stripe test mode is created by the API when STRIPE_SECRET_KEY is set;
 * otherwise a local test provider confirms the order immediately.
 */

export type PaymentSession = {
  status: "coming_soon" | "ready" | "failed" | "succeeded" | "requires_action";
  provider: "stub" | "stripe" | "razorpay" | "test";
  orderId?: string;
  amount?: number;
  currency?: string;
  checkoutUrl?: string;
  clientSecret?: string;
  message?: string;
};

export interface PaymentProvider {
  initiateCheckout(params: {
    orderId: string;
    amount: number;
    currency: string;
    customerEmail: string;
  }): Promise<PaymentSession>;
}

class StubPaymentProvider implements PaymentProvider {
  async initiateCheckout(params: {
    orderId: string;
    amount: number;
    currency: string;
    customerEmail: string;
  }): Promise<PaymentSession> {
    return {
      status: "coming_soon",
      provider: "stub",
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      message:
        "Payment integration pending — your order is saved. Secure checkout via Stripe or Razorpay will be enabled for launch.",
    };
  }
}

let provider: PaymentProvider = new StubPaymentProvider();

export function getPaymentProvider(): PaymentProvider {
  return provider;
}

/** Swap provider when Stripe/Razorpay is wired (e.g. from env). */
export function setPaymentProvider(next: PaymentProvider): void {
  provider = next;
}

export async function initiatePaymentFromCheckoutResponse(payment: {
  status: string;
  provider: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  message?: string;
}): Promise<PaymentSession> {
  if (payment.provider === "stub" || payment.status === "coming_soon") {
    return getPaymentProvider().initiateCheckout({
      orderId: payment.orderId ?? "",
      amount: payment.amount ?? 0,
      currency: payment.currency ?? "INR",
      customerEmail: "",
    });
  }

  return {
    status: payment.status as PaymentSession["status"],
    provider: payment.provider as PaymentSession["provider"],
    orderId: payment.orderId,
    amount: payment.amount,
    currency: payment.currency,
    message: payment.message,
  };
}
