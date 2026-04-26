from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class Booking(models.Model):
    """A member's confirmed seat in a CourseSession.

    Created by reservation_service.book(). Status flips to CANCELLED on
    user-initiated or automatic cancellation; a CANCELLED booking still
    exists in DB for audit purposes."""

    class Status(models.TextChoices):
        CONFIRMED = "confirmed", _("Confirmed")
        CANCELLED = "cancelled", _("Cancelled")
        ATTENDED = "attended", _("Attended")
        NO_SHOW = "no_show", _("No-show")

    class Channel(models.TextChoices):
        SUBSCRIPTION = "subscription", _("Covered by subscription")
        UNIT = "unit", _("Pay-per-class")

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    course_session = models.ForeignKey(
        "sessions_app.CourseSession",
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.CONFIRMED
    )
    channel = models.CharField(max_length=15, choices=Channel.choices)
    payment = models.ForeignKey(
        "payments.Payment",
        on_delete=models.SET_NULL,
        related_name="bookings",
        null=True,
        blank=True,
        help_text="Set for channel=unit; null for subscription-covered bookings.",
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["course_session", "status"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "course_session"],
                condition=models.Q(status="confirmed"),
                name="unique_confirmed_booking_per_user_session",
            )
        ]

    def __str__(self) -> str:
        return f"{self.user.email} → {self.course_session} ({self.status})"

    def cancel(self):
        if self.status == self.Status.CANCELLED:
            return
        self.status = self.Status.CANCELLED
        self.cancelled_at = timezone.now()
        self.save(update_fields=["status", "cancelled_at", "updated_at"])
