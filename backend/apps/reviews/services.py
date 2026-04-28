"""Eligibility rules for coach ratings.

A member is allowed to rate a coach only if they have at least one
CONFIRMED Booking on a session led by that coach which has already
started. (We accept "started" rather than "ended" so the member can
review while it's fresh.)"""

from __future__ import annotations

from django.utils import timezone

from apps.bookings.models import Booking
from apps.users.models import User


class RatingError(Exception):
    """User-facing rating failure."""


def assert_can_rate(*, member, coach) -> None:
    if member.id == coach.id:
        raise RatingError("You cannot rate yourself.")
    if coach.role != User.Role.COACH:
        raise RatingError("Only coaches can be rated.")

    eligible = Booking.objects.filter(
        user=member,
        status=Booking.Status.CONFIRMED,
        course_session__coach=coach,
        course_session__starts_at__lte=timezone.now(),
    ).exists()
    if not eligible:
        raise RatingError(
            "You must attend a session with this coach before rating them."
        )
