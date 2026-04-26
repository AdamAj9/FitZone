from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "kind",
        "status",
        "amount",
        "currency",
        "created_at",
    )
    list_filter = ("kind", "status", "currency")
    search_fields = (
        "user__email",
        "stripe_session_id",
        "stripe_payment_intent",
    )
    readonly_fields = (
        "stripe_session_id",
        "stripe_payment_intent",
        "stripe_event_id",
        "created_at",
        "updated_at",
    )
    autocomplete_fields = ("user", "subscription", "course", "course_session")
    date_hierarchy = "created_at"
