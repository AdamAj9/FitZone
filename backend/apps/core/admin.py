from django.contrib import admin

from .models import AuditLog, ContactMessage


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "actor", "action", "target_type", "target_id")
    list_filter = ("action",)
    search_fields = ("actor__email", "target_type", "metadata")
    readonly_fields = (
        "actor",
        "action",
        "target_type",
        "target_id",
        "metadata",
        "ip_address",
        "created_at",
    )
    date_hierarchy = "created_at"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("created_at", "email", "first_name", "last_name", "subject", "is_handled")
    list_filter = ("is_handled", "subject")
    search_fields = ("email", "first_name", "last_name", "message")
    list_editable = ("is_handled",)
    readonly_fields = (
        "last_name",
        "first_name",
        "email",
        "subject",
        "message",
        "created_at",
    )
    date_hierarchy = "created_at"

    def has_add_permission(self, request):
        # Messages only ever arrive through the public form.
        return False
