from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Subscription, SubscriptionPlan
from .serializers import (
    SubscribeSerializer,
    SubscriptionPlanSerializer,
    SubscriptionSerializer,
)


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """Public catalogue of the 4 subscription tiers."""

    queryset = SubscriptionPlan.objects.filter(is_active=True).order_by(
        "tier", "period"
    )
    serializer_class = SubscriptionPlanSerializer
    permission_classes = (AllowAny,)
    lookup_field = "slug"


class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    """List the current user's subscriptions (history) — read-only.
    Mutations go through dedicated @action endpoints below."""

    serializer_class = SubscriptionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        Subscription.expire_lapsed()
        qs = Subscription.objects.select_related("plan", "user").order_by(
            "-created_at"
        )
        if self.request.user.role != "admin":
            qs = qs.filter(user=self.request.user)
        return qs

    @action(detail=False, methods=["get"], url_path="current")
    def current(self, request):
        Subscription.expire_lapsed()
        sub = Subscription.current_for(request.user)
        if not sub:
            return Response({"subscription": None})
        return Response({"subscription": SubscriptionSerializer(sub).data})

    @action(detail=False, methods=["post"], url_path="subscribe")
    def subscribe(self, request):
        """POST /api/subscriptions/subscribe/

        Creates a Subscription tied to the current user. In dev mode
        (activate_now defaults to True) the subscription becomes ACTIVE
        immediately — Stripe checkout (Phase 5) will drive activation
        via webhook instead."""
        serializer = SubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = serializer.context["plan"]

        Subscription.expire_lapsed()
        if Subscription.current_for(request.user):
            raise ValidationError(
                {"detail": "You already have an active subscription."}
            )

        sub = Subscription.objects.create(
            user=request.user,
            plan=plan,
            price_paid=plan.price,
        )
        if serializer.validated_data.get("activate_now", True):
            sub.activate()
        return Response(
            SubscriptionSerializer(sub).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        sub = self.get_queryset().filter(pk=pk).first()
        if not sub:
            return Response(
                {"detail": "Subscription not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            sub.cancel()
        except Exception as exc:
            raise ValidationError({"detail": str(exc)}) from exc
        return Response(SubscriptionSerializer(sub).data)
