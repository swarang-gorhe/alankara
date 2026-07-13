/**
 * Payment provider abstraction for checkout.
 *
 * TODO: Stripe — create Checkout Session, handle webhook in apps/api
 * TODO: Razorpay — create Order, hosted checkout, webhook handler
 */

export type PaymentSession = {
  status: "coming_soon" | "ready" | "failed";
  provider: "stub" | "stripe" | "razorpay";
  orderId?: string;
  amount?: number;
  currency?: string;
  checkoutUrl?: string;
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
