from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.models import Course
from apps.sessions_app.models import CourseSession
from apps.sessions_app.serializers import SessionListSerializer

from . import services
from .models import Booking
from .serializers import BookingSerializer, BookSerializer


class BookingViewSet(viewsets.ReadOnlyModelViewSet):
    """List the current user's bookings.

    Mutations are exposed through @action endpoints:
    - POST /api/bookings/book/        -> reserve a session
    - POST /api/bookings/{id}/cancel/ -> cancel one of my bookings
    """

    serializer_class = BookingSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related(
                "course_session",
                "course_session__course",
                "course_session__room",
            )
            .order_by("-course_session__starts_at")
        )

    @action(detail=False, methods=["post"], url_path="book")
    def book(self, request):
        serializer = BookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            booking = services.book(
                user=request.user,
                course_session_id=serializer.validated_data["course_session_id"],
            )
        except services.NoEntitlementError as exc:
            raise PermissionDenied(detail=str(exc)) from exc
        except services.AlreadyBookedError as exc:
            raise ValidationError({"detail": str(exc)}) from exc
        except services.SessionFullError as exc:
            raise ValidationError({"detail": str(exc)}) from exc
        except services.SessionNotBookableError as exc:
            raise ValidationError({"detail": str(exc)}) from exc

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        try:
            booking = services.cancel(user=request.user, booking_id=int(pk))
        except services.BookingError as exc:
            raise ValidationError({"detail": str(exc)}) from exc
        return Response(BookingSerializer(booking).data)


class MyStatsView(APIView):
    """GET /api/me/stats/ — aggregated activity figures for the dashboard."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        now = timezone.now()
        start_30d = now - timedelta(days=30)

        confirmed = Booking.objects.filter(
            user=user, status=Booking.Status.CONFIRMED
        )
        attended_or_past = confirmed.filter(course_session__starts_at__lt=now)
        upcoming = confirmed.filter(course_session__starts_at__gte=now)

        last_30d_count = attended_or_past.filter(
            course_session__starts_at__gte=start_30d
        ).count()

        category_breakdown = list(
            Booking.objects.filter(
                user=user,
                status=Booking.Status.CONFIRMED,
                course_session__starts_at__lt=now,
            )
            .values("course_session__course__category__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )
        favorite_category = (
            category_breakdown[0]["course_session__course__category__name"]
            if category_breakdown
            else None
        )

        next_booking = (
            upcoming.select_related(
                "course_session__course", "course_session__room"
            )
            .order_by("course_session__starts_at")
            .first()
        )

        return Response(
            {
                "total_attended": attended_or_past.count(),
                "upcoming_count": upcoming.count(),
                "last_30_days": last_30d_count,
                "favorite_category": favorite_category,
                "category_breakdown": [
                    {
                        "category": row["course_session__course__category__name"],
                        "count": row["count"],
                    }
                    for row in category_breakdown
                ],
                "next_booking": (
                    BookingSerializer(next_booking).data if next_booking else None
                ),
            }
        )


class RecommendationsView(APIView):
    """GET /api/me/recommendations/ — up to 6 sessions tailored to the user.

    Strategy (in order, falling back when a tier yields too little):
    1. Categories the user already booked + same level (or "all")
    2. Categories from the questionnaire (preferences.categories)
    3. Most popular upcoming sessions matching the user's level
    Sessions the user is already booked into are excluded, as are full ones.
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        now = timezone.now()

        already_booked_session_ids = set(
            Booking.objects.filter(
                user=user, status=Booking.Status.CONFIRMED
            ).values_list("course_session_id", flat=True)
        )

        history_categories = list(
            Booking.objects.filter(user=user, status=Booking.Status.CONFIRMED)
            .values_list("course_session__course__category__slug", flat=True)
            .distinct()
        )

        profile = getattr(user, "member_profile", None)
        questionnaire_categories = (
            list((profile.preferences or {}).get("categories", []))
            if profile
            else []
        )
        member_level = profile.level if profile else None

        category_pool = list(
            dict.fromkeys(history_categories + questionnaire_categories)
        )

        base_qs = (
            CourseSession.objects.filter(
                status=CourseSession.Status.SCHEDULED,
                starts_at__gte=now,
            )
            .exclude(id__in=already_booked_session_ids)
            .select_related("course", "course__category", "coach", "room")
            .annotate(
                _seats_taken=Count(
                    "bookings", filter=Q(bookings__status="confirmed")
                )
            )
            .order_by("starts_at")
        )

        recommended: list[CourseSession] = []

        if category_pool:
            level_filter = (
                Q(course__level=member_level) | Q(course__level=Course.Level.ALL)
                if member_level
                else Q()
            )
            recommended = list(
                base_qs.filter(course__category__slug__in=category_pool)
                .filter(level_filter)[:6]
            )

        if len(recommended) < 6:
            seen = {s.id for s in recommended}
            extras = list(
                base_qs.exclude(id__in=seen)[: 6 - len(recommended)]
            )
            recommended.extend(extras)

        recommended = [
            s for s in recommended if s.seats_available > 0
        ][:6]

        return Response(
            {
                "based_on": {
                    "history_categories": history_categories,
                    "questionnaire_categories": questionnaire_categories,
                    "level": member_level,
                },
                "results": SessionListSerializer(recommended, many=True).data,
            }
        )
