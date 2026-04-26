from django.contrib import admin

from .models import Subscription, SubscriptionPlan


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "tier",
        "period",
        "price",
        "includes_classes",
        "is_active",
    )
    list_filter = ("tier", "period", "is_active")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "plan",
        "status",
        "starts_at",
        "ends_at",
        "price_paid",
        "created_at",
    )
    list_filter = ("status", "plan__tier", "plan__period")
    search_fields = ("user__email", "plan__name")
    autocomplete_fields = ("user", "plan")
    date_hierarchy = "created_at"
