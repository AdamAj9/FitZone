from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
