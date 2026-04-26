from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class SubscriptionPlan(models.Model):
    """The 4 commercial offerings (Basic/Premium × Monthly/Yearly)."""

    class Tier(models.TextChoices):
        BASIC = "basic", _("Basic")
        PREMIUM = "premium", _("Premium")

    class Period(models.TextChoices):
        MONTHLY = "monthly", _("Monthly")
        YEARLY = "yearly", _("Yearly")

    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    tier = models.CharField(max_length=10, choices=Tier.choices)
    period = models.CharField(max_length=10, choices=Period.choices)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField(blank=True)
    features = models.JSONField(
        default=list,
        blank=True,
        help_text="List of strings describing what's included.",
    )
    includes_classes = models.BooleanField(
        default=False,
        help_text="True for Premium tier (unlimited classes); False for Basic (gym only).",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["tier", "period"]
        constraints = [
            models.UniqueConstraint(
                fields=["tier", "period"], name="unique_plan_tier_period"
            )
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.get_period_display()})"

    @property
    def duration_days(self) -> int:
        return 30 if self.period == self.Period.MONTHLY else 365


class Subscription(models.Model):
    """Member's purchased subscription. Renewal is manual (a new Subscription
    is created)."""

    class Status(models.TextChoices):
        PENDING = "pending", _("Pending payment")
        ACTIVE = "active", _("Active")
        EXPIRED = "expired", _("Expired")
        CANCELLED = "cancelled", _("Cancelled")

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    price_paid = models.DecimalField(max_digits=8, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["status", "ends_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.user.email} → {self.plan.name} ({self.status})"

    def clean(self):
        super().clean()
        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValidationError({"ends_at": _("End must be after start.")})

    def activate(self, when=None):
        """Move from pending to active and set the validity window."""
        if self.status != self.Status.PENDING:
            raise ValidationError(
                f"Cannot activate a subscription in '{self.status}' state."
            )
        when = when or timezone.now()
        self.status = self.Status.ACTIVE
        self.starts_at = when
        self.ends_at = when + timedelta(days=self.plan.duration_days)
        self.save(update_fields=["status", "starts_at", "ends_at", "updated_at"])

    def cancel(self):
        if self.status not in (self.Status.PENDING, self.Status.ACTIVE):
            raise ValidationError(
                f"Cannot cancel a subscription in '{self.status}' state."
            )
        self.status = self.Status.CANCELLED
        self.cancelled_at = timezone.now()
        self.save(update_fields=["status", "cancelled_at", "updated_at"])

    @property
    def is_currently_active(self) -> bool:
        if self.status != self.Status.ACTIVE:
            return False
        now = timezone.now()
        return bool(self.starts_at and self.ends_at and self.starts_at <= now < self.ends_at)

    @property
    def days_remaining(self) -> int | None:
        if not self.ends_at:
            return None
        delta = self.ends_at - timezone.now()
        return max(0, delta.days)

    @classmethod
    def current_for(cls, user):
        """Return the user's current active subscription, or None."""
        return (
            cls.objects.filter(user=user, status=cls.Status.ACTIVE)
            .filter(starts_at__lte=timezone.now(), ends_at__gt=timezone.now())
            .order_by("-ends_at")
            .first()
        )

    @classmethod
    def expire_lapsed(cls):
        """Sweep ACTIVE subscriptions whose ends_at has passed."""
        return cls.objects.filter(
            status=cls.Status.ACTIVE, ends_at__lte=timezone.now()
        ).update(status=cls.Status.EXPIRED)
