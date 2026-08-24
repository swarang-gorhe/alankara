"""Payment provider abstraction — Stripe test mode, local test provider fallback."""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class PaymentProvider(ABC):
    provider_name: str

    @abstractmethod
    async def create_payment_session(
        self,
        *,
        order_id: str,
        amount: int,
        currency: str,
        customer_email: str,
    ) -> dict:
        """Create a payment session and return provider metadata."""

    async def verify_webhook(self, payload: bytes, signature: str | None) -> dict | None:
        return None


class TestPaymentProvider(PaymentProvider):
    """Auto-succeeds so local/dev checkout can complete without Stripe keys."""

    provider_name = "test"

    async def create_payment_session(
        self,
        *,
        order_id: str,
        amount: int,
        currency: str,
        customer_email: str,
    ) -> dict:
        return {
            "status": "succeeded",
            "provider": self.provider_name,
            "orderId": order_id,
            "amount": amount,
            "currency": currency,
            "customerEmail": customer_email,
            "message": "Test payment captured. Add STRIPE_SECRET_KEY to use Stripe test mode.",
        }


class StripePaymentProvider(PaymentProvider):
    provider_name = "stripe"

    async def create_payment_session(
        self,
        *,
        order_id: str,
        amount: int,
        currency: str,
        customer_email: str,
    ) -> dict:
        settings = get_settings()
        stripe_amount = amount * 100 if currency.upper() == "INR" else amount
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                "https://api.stripe.com/v1/payment_intents",
                auth=(settings.stripe_secret_key, ""),
                data={
                    "amount": str(stripe_amount),
                    "currency": currency.lower(),
                    "receipt_email": customer_email,
                    "metadata[order_id]": order_id,
                    "automatic_payment_methods[enabled]": "true",
                },
            )
        if response.status_code >= 400:
            logger.warning("stripe.intent_failed %s", response.text)
            return {
                "status": "failed",
                "provider": self.provider_name,
                "orderId": order_id,
                "amount": amount,
                "currency": currency,
                "message": "Could not start Stripe checkout. Please try again.",
            }
        data = response.json()
        return {
            "status": "requires_action",
            "provider": self.provider_name,
            "orderId": order_id,
            "amount": amount,
            "currency": currency,
            "clientSecret": data.get("client_secret"),
            "paymentIntentId": data.get("id"),
            "publishableKey": settings.stripe_publishable_key,
            "message": "Complete payment with Stripe to confirm your order.",
        }


def get_payment_provider() -> PaymentProvider:
    settings = get_settings()
    if settings.stripe_secret_key.strip():
        return StripePaymentProvider()
    return TestPaymentProvider()
