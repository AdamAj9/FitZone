from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "course_session",
        "status",
        "channel",
        "created_at",
    )
    list_filter = ("status", "channel")
    search_fields = ("user__email", "course_session__course__title")
    autocomplete_fields = ("user", "course_session", "payment")
    date_hierarchy = "created_at"
