from django.contrib import admin

from .models import Rating


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("id", "member", "coach", "score", "created_at")
    list_filter = ("score",)
    search_fields = ("member__email", "coach__email", "comment")
    autocomplete_fields = ("member", "coach", "course_session")
    date_hierarchy = "created_at"
