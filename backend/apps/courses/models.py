from django.conf import settings
from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _


class Category(models.Model):
    """Course category (e.g. Fitness, Pool, Tennis, Yoga)."""

    name = models.CharField(_("name"), max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(
        max_length=50,
        blank=True,
        help_text="Optional icon identifier (lucide-react name).",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Course(models.Model):
    """Generic course definition. Concrete time-slots live in CourseSession (Phase 3)."""

    class Level(models.TextChoices):
        BEGINNER = "beginner", _("Beginner")
        INTERMEDIATE = "intermediate", _("Intermediate")
        ADVANCED = "advanced", _("Advanced")
        ALL = "all", _("All levels")

    title = models.CharField(_("title"), max_length=150)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="courses",
    )
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="courses_taught",
        null=True,
        blank=True,
        limit_choices_to={"role": "coach"},
    )
    level = models.CharField(
        max_length=20, choices=Level.choices, default=Level.ALL
    )
    duration_minutes = models.PositiveSmallIntegerField(
        default=60, help_text="Standard session duration in minutes."
    )
    capacity = models.PositiveSmallIntegerField(
        default=15, help_text="Default seats per session."
    )
    price_unit = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0,
        help_text="Pay-per-class price (used by Basic-tier members).",
    )
    image = models.ImageField(upload_to="courses/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
