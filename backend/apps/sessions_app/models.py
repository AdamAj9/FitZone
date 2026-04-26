from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _


class Room(models.Model):
    """Physical room/space where a session takes place."""

    class Building(models.TextChoices):
        MAIN = "main", _("Main building")
        ANNEX = "annex", _("Annex building")

    name = models.CharField(max_length=80, unique=True)
    building = models.CharField(
        max_length=10, choices=Building.choices, default=Building.MAIN
    )
    capacity = models.PositiveSmallIntegerField(default=20)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["building", "name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.get_building_display()})"


class CourseSession(models.Model):
    """A scheduled occurrence of a course at a specific time and place."""

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", _("Scheduled")
        CANCELLED = "cancelled", _("Cancelled")
        COMPLETED = "completed", _("Completed")

    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="sessions_taught",
        null=True,
        blank=True,
        limit_choices_to={"role": "coach"},
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.PROTECT,
        related_name="sessions",
    )
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    capacity = models.PositiveSmallIntegerField(
        help_text="Seat cap for this specific session (defaults to course/room cap)."
    )
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.SCHEDULED
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["starts_at"]
        indexes = [
            models.Index(fields=["starts_at"]),
            models.Index(fields=["status", "starts_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(ends_at__gt=models.F("starts_at")),
                name="session_end_after_start",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.course.title} @ {self.starts_at:%Y-%m-%d %H:%M}"

    def clean(self):
        super().clean()
        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValidationError({"ends_at": _("End must be after start.")})

        if self.room and self.starts_at and self.ends_at:
            overlap = (
                CourseSession.objects.filter(
                    room=self.room,
                    status=self.Status.SCHEDULED,
                    starts_at__lt=self.ends_at,
                    ends_at__gt=self.starts_at,
                )
                .exclude(pk=self.pk)
                .exists()
            )
            if overlap:
                raise ValidationError(
                    {"room": _("This room already hosts another session in that slot.")}
                )

    def save(self, *args, **kwargs):
        if not self.capacity:
            self.capacity = (
                self.course.capacity if self.course_id else self.room.capacity
            )
        if not self.coach_id and self.course_id:
            self.coach = self.course.coach
        super().save(*args, **kwargs)

    @property
    def is_past(self) -> bool:
        from django.utils import timezone

        return self.starts_at < timezone.now()

    @property
    def seats_taken(self) -> int:
        """Number of confirmed bookings — wired in Phase 6."""
        return getattr(self, "_seats_taken", 0)

    @property
    def seats_available(self) -> int:
        return max(self.capacity - self.seats_taken, 0)
