from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Manager that uses email as the unique identifier."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email).lower()
        if "username" not in extra_fields or not extra_fields["username"]:
            extra_fields["username"] = email
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model — email is the login identifier; role drives permissions."""

    class Role(models.TextChoices):
        MEMBER = "member", _("Member")
        COACH = "coach", _("Coach")
        ADMIN = "admin", _("Admin")

    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(_("first name"), max_length=150, blank=True)
    last_name = models.CharField(_("last name"), max_length=150, blank=True)
    role = models.CharField(
        _("role"), max_length=10, choices=Role.choices, default=Role.MEMBER
    )
    phone = models.CharField(_("phone"), max_length=30, blank=True)
    preferred_language = models.CharField(
        _("preferred language"),
        max_length=5,
        choices=[("fr", "Français"), ("en", "English")],
        default="fr",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.email

    @property
    def is_member(self) -> bool:
        return self.role == self.Role.MEMBER

    @property
    def is_coach(self) -> bool:
        return self.role == self.Role.COACH

    @property
    def is_admin_role(self) -> bool:
        return self.role == self.Role.ADMIN


class MemberProfile(models.Model):
    """Profile attached to a member user — fitness goals, level, preferences."""

    class Level(models.TextChoices):
        BEGINNER = "beginner", _("Beginner")
        INTERMEDIATE = "intermediate", _("Intermediate")
        ADVANCED = "advanced", _("Advanced")

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="member_profile"
    )
    date_of_birth = models.DateField(null=True, blank=True)
    level = models.CharField(
        max_length=20, choices=Level.choices, default=Level.BEGINNER
    )
    goals = models.TextField(blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    questionnaire_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"MemberProfile<{self.user.email}>"


class CoachProfile(models.Model):
    """Profile attached to a coach user — bio, specialties, public-facing data."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="coach_profile"
    )
    bio = models.TextField(blank=True)
    specialties = models.CharField(
        max_length=255, blank=True, help_text="Comma-separated list of specialties"
    )
    years_of_experience = models.PositiveSmallIntegerField(default=0)
    photo = models.ImageField(upload_to="coaches/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"CoachProfile<{self.user.email}>"

    @property
    def specialties_list(self) -> list[str]:
        return [s.strip() for s in self.specialties.split(",") if s.strip()]
