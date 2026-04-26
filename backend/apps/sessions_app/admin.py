from django.contrib import admin

from .models import CourseSession, Room


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("name", "building", "capacity", "is_active")
    list_filter = ("building", "is_active")
    search_fields = ("name",)


@admin.register(CourseSession)
class CourseSessionAdmin(admin.ModelAdmin):
    list_display = (
        "course",
        "starts_at",
        "ends_at",
        "room",
        "coach",
        "capacity",
        "status",
    )
    list_filter = ("status", "room", "course__category")
    search_fields = ("course__title",)
    autocomplete_fields = ("course", "coach", "room")
    date_hierarchy = "starts_at"
