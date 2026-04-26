from django.contrib import admin

from .models import Category, Course


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "coach",
        "level",
        "duration_minutes",
        "capacity",
        "price_unit",
        "is_active",
    )
    list_filter = ("category", "level", "is_active")
    search_fields = ("title", "description")
    autocomplete_fields = ("coach",)
    prepopulated_fields = {"slug": ("title",)}
