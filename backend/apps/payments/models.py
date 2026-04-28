from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Payment(models.Model):
    """Tracks one Stripe Checkout attempt and its lifecycle.

    A Payment is always tied to a user. It targets EITHER:
    - a Subscription (kind=subscription, fk subscription) — activated on success
    - a Course (kind=course, fk course) — Phase 6 will create a Booking on success
    """

    class Kind(models.TextChoices):
        SUBSCRIPTION = "subscription", _("Subscription")
        COURSE = "course", _("Pay-per-class")

    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        SUCCEEDED = "succeeded", _("Succeeded")
        FAILED = "failed", _("Failed")
        REFUNDED = "refunded", _("Refunded")

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    kind = models.CharField(max_length=20, choices=Kind.choices)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )

    subscription = models.ForeignKey(
        "subscriptions.Subscription",
        on_delete=models.SET_NULL,
        related_name="payments",
        null=True,
        blank=True,
    )
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.SET_NULL,
        related_name="payments",
        null=True,
        blank=True,
    )
    course_session = models.ForeignKey(
        "sessions_app.CourseSession",
        on_delete=models.SET_NULL,
        related_name="payments",
        null=True,
        blank=True,
        help_text="Specific session targeted (Phase 6).",
    )

    amount = models.DecimalField(max_digits=8, decimal_places=2)
    currency = models.CharField(max_length=3, default="EUR")

    stripe_session_id = models.CharField(max_length=200, blank=True, db_index=True)
    stripe_payment_intent = models.CharField(max_length=200, blank=True)
    stripe_event_id = models.CharField(
        max_length=200,
        blank=True,
        db_index=True,
        help_text="Last successful webhook event id (for idempotency).",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "status"])]

    def __str__(self) -> str:
        target = self.subscription or self.course
        return f"{self.user.email} · {self.kind} · {self.status} · {target}"

    @property
    def amount_cents(self) -> int:
        return int(self.amount * 100)

    def mark_succeeded(self, *, payment_intent: str = "", event_id: str = ""):
        self.status = self.Status.SUCCEEDED
        if payment_intent:
            self.stripe_payment_intent = payment_intent
        if event_id:
            self.stripe_event_id = event_id
        self.save(
            update_fields=[
                "status",
                "stripe_payment_intent",
                "stripe_event_id",
                "updated_at",
            ]
        )
        from apps.core.audit import record as audit

        audit(
            "pay_succeeded",
            actor=self.user,
            target=self,
            metadata={"kind": self.kind, "amount": str(self.amount)},
        )

    def mark_failed(self, *, event_id: str = ""):
        self.status = self.Status.FAILED
        if event_id:
            self.stripe_event_id = event_id
        self.save(update_fields=["status", "stripe_event_id", "updated_at"])
        from apps.core.audit import record as audit

        audit(
            "pay_failed",
            actor=self.user,
            target=self,
            metadata={"kind": self.kind, "amount": str(self.amount)},
        )
