from rest_framework import serializers

from .models import Subscription, SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    tier_display = serializers.CharField(source="get_tier_display", read_only=True)
    period_display = serializers.CharField(source="get_period_display", read_only=True)
    duration_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = SubscriptionPlan
        fields = (
            "id",
            "name",
            "slug",
            "tier",
            "tier_display",
            "period",
            "period_display",
            "price",
            "description",
            "features",
            "includes_classes",
            "duration_days",
            "is_active",
        )


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    is_currently_active = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True, allow_null=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Subscription
        fields = (
            "id",
            "plan",
            "status",
            "status_display",
            "starts_at",
            "ends_at",
            "cancelled_at",
            "price_paid",
            "is_currently_active",
            "days_remaining",
            "created_at",
        )


class SubscribeSerializer(serializers.Serializer):
    """Used by POST /subscriptions/subscribe/. Phase 5 will redirect to
    Stripe checkout instead of activating immediately."""

    plan_id = serializers.IntegerField()
    activate_now = serializers.BooleanField(
        default=True,
        help_text="Dev-mode flag: if true, the subscription is activated "
        "immediately. Will be removed once Stripe checkout (Phase 5) handles "
        "activation via webhook.",
    )

    def validate_plan_id(self, value):
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
        except SubscriptionPlan.DoesNotExist as exc:
            raise serializers.ValidationError("Plan not found or inactive.") from exc
        self.context["plan"] = plan
        return value
