from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    kind_display = serializers.CharField(source="get_kind_display", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    subscription_plan = serializers.CharField(
        source="subscription.plan.name", read_only=True, default=None
    )
    course_title = serializers.CharField(
        source="course.title", read_only=True, default=None
    )

    class Meta:
        model = Payment
        fields = (
            "id",
            "user_email",
            "kind",
            "kind_display",
            "status",
            "status_display",
            "amount",
            "currency",
            "subscription",
            "subscription_plan",
            "course",
            "course_title",
            "course_session",
            "stripe_session_id",
            "created_at",
        )
        read_only_fields = fields


class CheckoutSubscriptionSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()


class CheckoutCourseSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    course_session_id = serializers.IntegerField(required=False, allow_null=True)
