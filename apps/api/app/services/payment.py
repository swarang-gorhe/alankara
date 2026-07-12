"""Payment provider abstraction — Stripe / Razorpay wired in a later phase."""

from abc import ABC, abstractmethod


class PaymentProvider(ABC):
    @abstractmethod
    async def create_payment_session(
        self,
        *,
        order_id: str,
        amount: int,
        currency: str,
        customer_email: str,
    ) -> dict:
        """Create a hosted payment session and return provider metadata."""


class StubPaymentProvider(PaymentProvider):
    """Test-mode stub until Stripe or Razorpay is integrated."""

    async def create_payment_session(
        self,
        *,
        order_id: str,
        amount: int,
        currency: str,
        customer_email: str,
    ) -> dict:
        # TODO: Stripe — PaymentIntent / Checkout Session
        # TODO: Razorpay — Order + hosted checkout
        return {
            "status": "coming_soon",
            "provider": "stub",
            "orderId": order_id,
            "amount": amount,
            "currency": currency,
            "customerEmail": customer_email,
            "message": "Payment gateway integration arrives in a future phase.",
        }


def get_payment_provider() -> PaymentProvider:
    return StubPaymentProvider()
