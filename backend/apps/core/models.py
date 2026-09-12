from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class AuditLog(models.Model):
    """Append-only audit trail of significant actions across the platform.

    Written by signals (login, booking created/cancelled, subscription
    activated, payment succeeded/failed) and by the admin endpoints when
    a staff user mutates a resource. Read-only from the API; the only
    sanctioned removal is via Django admin or a dedicated retention job."""

    class Action(models.TextChoices):
        LOGIN = "login", _("Login")
        LOGOUT = "logout", _("Logout")
        REGISTER = "register", _("Register")
        PASSWORD_CHANGED = "password_changed", _("Password changed")
        SUBSCRIPTION_ACTIVATED = "sub_activated", _("Subscription activated")
        SUBSCRIPTION_CANCELLED = "sub_cancelled", _("Subscription cancelled")
        PAYMENT_SUCCEEDED = "pay_succeeded", _("Payment succeeded")
        PAYMENT_FAILED = "pay_failed", _("Payment failed")
        BOOKING_CREATED = "book_created", _("Booking created")
        BOOKING_CANCELLED = "book_cancelled", _("Booking cancelled")
        ADMIN_USER_TOGGLED = "admin_user_toggled", _("Admin: user toggled")
        ADMIN_USER_ROLE_CHANGED = "admin_user_role_changed", _("Admin: role changed")

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
        null=True,
        blank=True,
        help_text="User who performed the action; null for system events.",
    )
    action = models.CharField(max_length=40, choices=Action.choices)
    target_type = models.CharField(
        max_length=80,
        blank=True,
        help_text="App-qualified model name, e.g. 'subscriptions.Subscription'.",
    )
    target_id = models.PositiveIntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["action", "-created_at"]),
            models.Index(fields=["actor", "-created_at"]),
        ]

    def __str__(self) -> str:
        actor = self.actor.email if self.actor_id else "system"
        return f"{self.created_at:%Y-%m-%d %H:%M} {actor} · {self.action}"


class ContactMessage(models.Model):
    """A message sent from the public contact form.

    Stored as well as emailed: the mail is best-effort (see emails.py), so
    the row is what guarantees an enquiry is never silently lost when SMTP
    is misconfigured. Staff triage them from Django admin via `is_handled`.
    """

    class Subject(models.TextChoices):
        MEMBERSHIP = "membership", _("Memberships and pricing")
        CLASSES = "classes", _("Classes and schedule")
        COACHING = "coaching", _("Personal coaching")
        FACILITIES = "facilities", _("Facilities")
        OTHER = "other", _("Something else")

    last_name = models.CharField(max_length=80)
    first_name = models.CharField(max_length=80)
    email = models.EmailField()
    subject = models.CharField(
        max_length=20,
        choices=Subject.choices,
        default=Subject.OTHER,
    )
    message = models.TextField(max_length=4000)
    is_handled = models.BooleanField(
        default=False,
        help_text="Ticked by staff once the enquiry has been answered.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["is_handled", "-created_at"])]

    def __str__(self) -> str:
        return f"{self.created_at:%Y-%m-%d %H:%M} {self.email} · {self.subject}"
