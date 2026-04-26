from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from django.utils.dateparse import parse_date
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny

from apps.users.models import User
from apps.users.permissions import IsCoachOrAdmin

from .models import CourseSession, Room
from .serializers import (
    RoomSerializer,
    SessionDetailSerializer,
    SessionListSerializer,
    SessionWriteSerializer,
)


class RoomViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Room.objects.filter(is_active=True).order_by("building", "name")
    serializer_class = RoomSerializer
    permission_classes = (AllowAny,)


class CourseSessionViewSet(viewsets.ModelViewSet):
    """List/detail public; create/update restricted to the coach owning the
    parent course (Phase 2 rule) or admin."""

    lookup_field = "pk"
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = (
        "course",
        "course__slug",
        "course__category__slug",
        "coach",
        "room",
        "status",
    )
    ordering_fields = ("starts_at", "ends_at")
    ordering = ("starts_at",)

    def get_queryset(self):
        qs = (
            CourseSession.objects.select_related(
                "course", "course__category", "coach", "room"
            )
            .annotate(
                _seats_taken=Count(
                    "bookings", filter=Q(bookings__status="confirmed")
                )
            )
            .all()
        )

        params = self.request.query_params

        date_from = params.get("from")
        date_to = params.get("to")
        if date_from:
            parsed = parse_date(date_from)
            if not parsed:
                raise ValidationError({"from": "Invalid date (expected YYYY-MM-DD)."})
            qs = qs.filter(starts_at__date__gte=parsed)
        if date_to:
            parsed = parse_date(date_to)
            if not parsed:
                raise ValidationError({"to": "Invalid date (expected YYYY-MM-DD)."})
            qs = qs.filter(starts_at__date__lte=parsed)

        if params.get("upcoming") == "1":
            qs = qs.filter(starts_at__gte=timezone.now())

        if self.action in ("list", "retrieve"):
            user = self.request.user
            if not (
                user.is_authenticated
                and (user.role == User.Role.ADMIN or user.is_superuser)
            ):
                qs = qs.exclude(status=CourseSession.Status.CANCELLED)

        if self.action not in ("list", "retrieve"):
            user = self.request.user
            if user.is_authenticated and user.role == User.Role.COACH:
                qs = qs.filter(course__coach=user)

        return qs

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return SessionWriteSerializer
        if self.action == "retrieve":
            return SessionDetailSerializer
        return SessionListSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsCoachOrAdmin()]

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data["course"]
        if (
            user.role == User.Role.COACH
            and course.coach_id
            and course.coach_id != user.id
        ):
            raise ValidationError(
                {"course": "You can only schedule sessions for your own courses."}
            )
        if "coach" not in serializer.validated_data:
            serializer.validated_data["coach"] = course.coach or user
        serializer.save()

    @staticmethod
    def default_planning_window():
        today = timezone.localdate()
        return today, today + timedelta(days=14)
