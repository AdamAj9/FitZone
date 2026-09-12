from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import AuditLog, ContactMessage

User = get_user_model()


class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.SerializerMethodField()
    action_display = serializers.CharField(
        source="get_action_display", read_only=True
    )

    class Meta:
        model = AuditLog
        fields = (
            "id",
            "actor",
            "actor_email",
            "action",
            "action_display",
            "target_type",
            "target_id",
            "metadata",
            "ip_address",
            "created_at",
        )
        read_only_fields = fields

    def get_actor_email(self, obj: AuditLog) -> str | None:
        return obj.actor.email if obj.actor_id else None


class AdminUserSerializer(serializers.ModelSerializer):
    """Admin-only payload — exposes role, flags, last_login."""

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
        )
        read_only_fields = (
            "id",
            "email",
            "username",
            "date_joined",
            "last_login",
            "is_superuser",
        )


class ContactMessageSerializer(serializers.ModelSerializer):
    """Write-only: the public form posts it, nothing ever reads it back."""

    class Meta:
        model = ContactMessage
        fields = ("id", "last_name", "first_name", "email", "subject", "message")
        read_only_fields = ("id",)

    def validate_message(self, value: str) -> str:
        stripped = value.strip()
        if len(stripped) < 4:
            raise serializers.ValidationError(
                "Votre message doit faire au moins 4 caractères."
            )
        return stripped
