"""Transactional email — Resend when configured, otherwise structured logs."""

from __future__ import annotations

import logging

import httpx

from app.config import get_settings
from app.models.order import Order

logger = logging.getLogger(__name__)


def _format_inr(amount: int) -> str:
    return f"₹{amount:,}"


def _order_items_html(order: Order) -> str:
    rows = []
    for item in order.items:
        rows.append(
            "<tr>"
            f"<td style='padding:8px 0'>{item.product_name}</td>"
            f"<td style='padding:8px 0;text-align:center'>{item.quantity}</td>"
            f"<td style='padding:8px 0;text-align:right'>{_format_inr(item.line_total_amount)}</td>"
            "</tr>"
        )
    return "".join(rows)


def render_order_email(order: Order, *, heading: str, intro: str) -> tuple[str, str]:
    subject = f"{heading} — {order.id}"
    html = f"""
    <div style="font-family:Georgia,serif;background:#FAF3E7;padding:32px;color:#2B231C">
      <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#C9932F">Alankara</p>
      <h1 style="font-weight:normal;color:#6F2317">{heading}</h1>
      <p>{intro}</p>
      <p>Order <strong>{order.id}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        {_order_items_html(order)}
        <tr>
          <td colspan="2" style="padding-top:12px;border-top:1px solid #C9932F">Total</td>
          <td style="padding-top:12px;border-top:1px solid #C9932F;text-align:right">
            {_format_inr(order.total_amount)} {order.currency}
          </td>
        </tr>
      </table>
      <p style="font-size:13px;color:#5C5248">Crafted for little moments.</p>
    </div>
    """
    return subject, html


async def send_email(*, to: str, subject: str, html: str) -> bool:
    settings = get_settings()
    if not settings.resend_api_key.strip():
        logger.info("email.skip to=%s subject=%s", to, subject)
        return False

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": settings.email_from,
                    "to": [to],
                    "subject": subject,
                    "html": html,
                },
            )
        if response.status_code >= 400:
            logger.warning("email.failed status=%s body=%s", response.status_code, response.text)
            return False
        return True
    except httpx.HTTPError:
        logger.exception("email.error to=%s", to)
        return False


async def send_order_confirmation(order: Order) -> None:
    subject, html = render_order_email(
        order,
        heading="Your order is confirmed",
        intro="Thank you for choosing Alankara. We have received your order and will begin preparing it with care.",
    )
    await send_email(to=order.email, subject=subject, html=html)


async def send_order_status_email(order: Order) -> None:
    copy = {
        "confirmed": ("Your order is confirmed", "We are preparing your pieces in the atelier."),
        "processing": ("Your order is being prepared", "The makers have begun assembling your order."),
        "shipped": ("Your order is on its way", "Your Alankara pieces have left the atelier."),
        "delivered": ("Your order has arrived", "We hope it brings a little moment of joy."),
        "cancelled": ("Your order was cancelled", "This order has been cancelled. If this is unexpected, write to us."),
        "paid": ("Payment received", "We have received your payment and will begin preparing your order."),
    }
    heading, intro = copy.get(
        order.status,
        ("Order update", f"Your order status is now {order.status}."),
    )
    subject, html = render_order_email(order, heading=heading, intro=intro)
    await send_email(to=order.email, subject=subject, html=html)
