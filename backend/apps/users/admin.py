from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import CoachProfile, MemberProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "role", "is_staff", "date_joined")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-date_joined",)
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        (
            _("Personal info"),
            {"fields": ("first_name", "last_name", "phone", "preferred_language")},
        ),
        (_("Role"), {"fields": ("role",)}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "username",
                    "password1",
                    "password2",
                    "role",
                ),
            },
        ),
    )


@admin.register(MemberProfile)
class MemberProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "level", "questionnaire_completed", "created_at")
    list_filter = ("level", "questionnaire_completed")
    search_fields = ("user__email",)


@admin.register(CoachProfile)
class CoachProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "years_of_experience", "created_at")
    search_fields = ("user__email", "specialties")
