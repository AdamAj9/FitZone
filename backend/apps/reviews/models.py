from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


class Rating(models.Model):
    """A member's 1-5 star rating + optional comment about a coach.

    Eligibility is enforced at the service layer: a user can only rate a
    coach after attending (or being booked into a past session of) one of
    that coach's sessions. The unique constraint here just blocks the
    obvious double-write per (member, coach) pair."""

    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ratings_given",
    )
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ratings_received",
        limit_choices_to={"role": "coach"},
    )
    course_session = models.ForeignKey(
        "sessions_app.CourseSession",
        on_delete=models.SET_NULL,
        related_name="ratings",
        null=True,
        blank=True,
        help_text=_("The session that triggered this review."),
    )
    score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["member", "coach"], name="unique_rating_per_member_coach"
            )
        ]
        indexes = [models.Index(fields=["coach"])]

    def __str__(self) -> str:
        return f"{self.member.email} → {self.coach.email}: {self.score}/5"
