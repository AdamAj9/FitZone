from django.db import IntegrityError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from . import services
from .models import Rating
from .serializers import RatingSerializer, RatingWriteSerializer


class RatingViewSet(viewsets.ModelViewSet):
    """List/detail public (filterable by coach), create/update/delete
    require auth and the user must own the rating."""

    queryset = Rating.objects.select_related("member", "coach").all()
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ("coach", "member")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return RatingWriteSerializer
        return RatingSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        coach = serializer.validated_data["coach"]
        try:
            services.assert_can_rate(member=self.request.user, coach=coach)
        except services.RatingError as exc:
            raise PermissionDenied(detail=str(exc)) from exc
        try:
            serializer.save(member=self.request.user)
        except IntegrityError as exc:
            raise ValidationError(
                {"detail": "You have already rated this coach."}
            ) from exc

    def perform_update(self, serializer):
        if serializer.instance.member_id != self.request.user.id:
            raise PermissionDenied("You can only edit your own rating.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.member_id != self.request.user.id:
            raise PermissionDenied("You can only delete your own rating.")
        instance.delete()

    @action(detail=False, methods=["get"], url_path="mine")
    def mine(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        qs = self.get_queryset().filter(member=request.user)
        page = self.paginate_queryset(qs)
        serializer = RatingSerializer(page or qs, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)
