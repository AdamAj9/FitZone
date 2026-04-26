"""Thin wrapper around stripe.checkout.Session.create.

Kept dependency-light so unit tests can monkeypatch `_session_create` instead
of having to mock the stripe SDK at import time."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

import stripe
from django.conf import settings

if TYPE_CHECKING:
    from .models import Payment


@dataclass
class CheckoutResult:
    session_id: str
    url: str


def _session_create(**kwargs):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe.checkout.Session.create(**kwargs)


def _session_retrieve(session_id: str):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe.checkout.Session.retrieve(session_id)


def _build_metadata(payment: "Payment") -> dict[str, str]:
    return {
        "payment_id": str(payment.id),
        "user_id": str(payment.user_id),
        "kind": payment.kind,
        "subscription_id": str(payment.subscription_id or ""),
        "course_id": str(payment.course_id or ""),
        "course_session_id": str(payment.course_session_id or ""),
    }


def create_checkout_session(
    payment: "Payment",
    *,
    product_name: str,
    success_path: str,
    cancel_path: str,
) -> CheckoutResult:
    """Create a Stripe Checkout Session for the given Payment row.

    The Payment must already exist (so we can stamp metadata with payment_id),
    but is in PENDING status until the webhook fires."""
    frontend = settings.FRONTEND_URL.rstrip("/")
    session = _session_create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": payment.currency.lower(),
                    "product_data": {"name": product_name},
                    "unit_amount": payment.amount_cents,
                },
                "quantity": 1,
            }
        ],
        client_reference_id=str(payment.user_id),
        metadata=_build_metadata(payment),
        success_url=f"{frontend}{success_path}?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{frontend}{cancel_path}",
    )

    payment.stripe_session_id = session["id"]
    payment.save(update_fields=["stripe_session_id", "updated_at"])

    return CheckoutResult(session_id=session["id"], url=session["url"])
