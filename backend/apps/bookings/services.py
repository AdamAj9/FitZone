"""Reservation business logic.

The single entry point `book()` enforces all rules:
- one user can only have one CONFIRMED booking per session
- a session must be SCHEDULED (not cancelled / completed) and in the future
- the user must either have an active Premium subscription, or have paid
  the per-unit price (channel=unit)
- the session's confirmed-bookings count must not exceed its capacity

Race conditions are handled with `select_for_update()` on the CourseSession
inside an atomic block — concurrent reservations for the last seat get
serialised at the DB level and the second caller sees SessionFullError.
"""

from __future__ import annotations

from django.db import transaction
from django.utils import timezone

from apps.sessions_app.models import CourseSession
from apps.subscriptions.models import Subscription

from .models import Booking


class BookingError(Exception):
    """Generic booking failure — message is user-facing."""


class SessionFullError(BookingError):
    pass


class AlreadyBookedError(BookingError):
    pass


class SessionNotBookableError(BookingError):
    pass


class NoEntitlementError(BookingError):
    """User has neither an active Premium sub nor a paid Payment for this course."""


def _user_has_premium(user) -> bool:
    sub = Subscription.current_for(user)
    return bool(sub and sub.plan.includes_classes)


@transaction.atomic
def book(*, user, course_session_id: int, payment=None) -> Booking:
    """Create a CONFIRMED booking for the given user/session.

    `payment` is optional; pass it when called from the Stripe verify/webhook
    path for a unit-paid course. Otherwise the function will refuse the
    booking unless the user has a Premium subscription that includes classes.
    """
    session = (
        CourseSession.objects.select_for_update()
        .select_related("course")
        .filter(id=course_session_id)
        .first()
    )
    if not session:
        raise SessionNotBookableError("Session not found.")

    if session.status != CourseSession.Status.SCHEDULED:
        raise SessionNotBookableError("Session is not open for booking.")

    if session.starts_at < timezone.now():
        raise SessionNotBookableError("Session has already started.")

    if Booking.objects.filter(
        user=user,
        course_session=session,
        status=Booking.Status.CONFIRMED,
    ).exists():
        raise AlreadyBookedError("You already have a booking for this session.")

    confirmed_count = Booking.objects.filter(
        course_session=session, status=Booking.Status.CONFIRMED
    ).count()
    if confirmed_count >= session.capacity:
        raise SessionFullError("This session is full.")

    if payment is not None:
        channel = Booking.Channel.UNIT
    elif _user_has_premium(user):
        channel = Booking.Channel.SUBSCRIPTION
    else:
        raise NoEntitlementError(
            "Active Premium subscription or per-class payment required."
        )

    return Booking.objects.create(
        user=user,
        course_session=session,
        channel=channel,
        payment=payment,
    )


def cancel(*, user, booking_id: int) -> Booking:
    booking = Booking.objects.filter(id=booking_id, user=user).first()
    if not booking:
        raise BookingError("Booking not found.")
    if booking.status != Booking.Status.CONFIRMED:
        raise BookingError("Only confirmed bookings can be cancelled.")
    if booking.course_session.starts_at < timezone.now():
        raise BookingError("Cannot cancel a session that has already started.")
    booking.cancel()
    return booking


def book_for_payment(payment) -> Booking | None:
    """Called by the Stripe verify/webhook flow for kind=course payments.
    Idempotent: if a booking already exists for this payment, returns it."""
    existing = Booking.objects.filter(payment=payment).first()
    if existing:
        return existing
    if not payment.course_session_id:
        return None
    try:
        return book(
            user=payment.user,
            course_session_id=payment.course_session_id,
            payment=payment,
        )
    except BookingError:
        return None
