from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny

from apps.users.models import User as UserModel
from apps.users.permissions import IsCoachOrAdmin

from .models import Category, Course
from .serializers import (
    CategorySerializer,
    CoachPublicSerializer,
    CourseDetailSerializer,
    CourseListSerializer,
    CourseWriteSerializer,
)

User = get_user_model()


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only categories list/detail."""

    serializer_class = CategorySerializer
    permission_classes = (AllowAny,)
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Category.objects.filter(is_active=True)
            .annotate(
                course_count=Count("courses", filter=Q(courses__is_active=True))
            )
            .order_by("name")
        )


class CourseViewSet(viewsets.ModelViewSet):
    """List/detail public; create/update/delete restricted to coach or admin.

    Coaches see and edit only their own courses; admins see everything.
    """

    queryset = Course.objects.select_related("category", "coach").all()
    lookup_field = "slug"
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("category__slug", "level", "coach", "is_active")
    search_fields = ("title", "description")
    ordering_fields = ("created_at", "title", "price_unit", "duration_minutes")
    ordering = ("-created_at",)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return CourseWriteSerializer
        if self.action == "retrieve":
            return CourseDetailSerializer
        return CourseListSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsCoachOrAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if self.action in ("list", "retrieve"):
            if not (
                user.is_authenticated
                and (user.role == UserModel.Role.ADMIN or user.is_superuser)
            ):
                qs = qs.filter(is_active=True)
            return qs

        if user.is_authenticated and user.role == UserModel.Role.COACH:
            return qs.filter(coach=user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == UserModel.Role.COACH:
            serializer.save(coach=user)
        else:
            serializer.save()


class CoachViewSet(viewsets.ReadOnlyModelViewSet):
    """Public list/detail of coaches with their profile data."""

    serializer_class = CoachPublicSerializer
    permission_classes = (AllowAny,)
    filter_backends = (filters.SearchFilter,)
    search_fields = ("first_name", "last_name", "coach_profile__specialties")

    def get_queryset(self):
        return (
            User.objects.filter(role=UserModel.Role.COACH, is_active=True)
            .select_related("coach_profile")
            .annotate(
                _rating_avg=Avg("ratings_received__score"),
                _rating_count=Count("ratings_received"),
            )
            .order_by("first_name", "last_name")
        )
