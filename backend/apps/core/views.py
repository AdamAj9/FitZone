from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.subscriptions.models import Subscription
from apps.users.permissions import IsAdminRole

from .audit import record as audit
from .models import AuditLog
from .serializers import AdminUserSerializer, AuditLogSerializer

User = get_user_model()


class AdminPermissionMixin:
    permission_classes = (IsAuthenticated, IsAdminRole)


class AuditLogViewSet(AdminPermissionMixin, viewsets.ReadOnlyModelViewSet):
    """List/detail of every AuditLog row (admin only). Read-only by design."""

    queryset = AuditLog.objects.select_related("actor").all()
    serializer_class = AuditLogSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = ("action", "actor", "target_type")
    search_fields = ("actor__email", "target_type")


class AdminUserViewSet(AdminPermissionMixin, viewsets.ModelViewSet):
    """Admin user management — list/detail, toggle active, change role.

    Edits go through partial_update; the @action endpoint `toggle_active`
    is a one-click activate/deactivate, and `set_role` lets an admin
    change a member to coach (or vice-versa)."""

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = ("role", "is_active", "is_staff")
    search_fields = ("email", "first_name", "last_name")

    def perform_destroy(self, instance):
        if instance.id == self.request.user.id:
            raise ValidationError({"detail": "You cannot delete yourself."})
        if instance.is_superuser and not self.request.user.is_superuser:
            raise ValidationError({"detail": "Only superusers can delete superusers."})
        super().perform_destroy(instance)

    @action(detail=True, methods=["post"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        if user.id == request.user.id:
            raise ValidationError({"detail": "You cannot deactivate yourself."})
        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])
        audit(
            "admin_user_toggled",
            actor=request.user,
            target=user,
            metadata={"is_active": user.is_active},
        )
        return Response(AdminUserSerializer(user).data)

    @action(detail=True, methods=["post"], url_path="set-role")
    def set_role(self, request, pk=None):
        new_role = request.data.get("role")
        if new_role not in dict(User.Role.choices):
            raise ValidationError({"role": "Invalid role."})
        user = self.get_object()
        old_role = user.role
        user.role = new_role
        user.save(update_fields=["role"])
        audit(
            "admin_user_role_changed",
            actor=request.user,
            target=user,
            metadata={"from": old_role, "to": new_role},
        )
        return Response(AdminUserSerializer(user).data)


class AdminDashboardView(APIView):
    """GET /api/admin/dashboard/ — high-level KPIs for the back-office home."""

    permission_classes = (IsAuthenticated, IsAdminRole)

    def get(self, request):
        now = timezone.now()
        last_30 = now - timedelta(days=30)

        users_total = User.objects.count()
        members = User.objects.filter(role=User.Role.MEMBER).count()
        coaches = User.objects.filter(role=User.Role.COACH).count()

        active_subs = Subscription.objects.filter(
            status=Subscription.Status.ACTIVE,
            starts_at__lte=now,
            ends_at__gt=now,
        ).count()

        revenue_30d = Payment.objects.filter(
            status=Payment.Status.SUCCEEDED, created_at__gte=last_30
        ).aggregate(total=Sum("amount"))["total"] or 0

        bookings_30d = Booking.objects.filter(
            status=Booking.Status.CONFIRMED, created_at__gte=last_30
        ).count()

        recent_actions = list(
            AuditLog.objects.values("action")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )

        return Response(
            {
                "users": {
                    "total": users_total,
                    "members": members,
                    "coaches": coaches,
                },
                "active_subscriptions": active_subs,
                "revenue_last_30_days": str(revenue_30d),
                "bookings_last_30_days": bookings_30d,
                "top_actions": recent_actions,
            }
        )
