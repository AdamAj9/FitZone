from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import CoachProfile, MemberProfile
from .serializers import (
    CoachProfileSerializer,
    FitZoneTokenObtainPairSerializer,
    MemberProfileSerializer,
    QuestionnaireSerializer,
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create a member account."""

    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ — exchange email + password for JWT pair."""

    serializer_class = FitZoneTokenObtainPairSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            from apps.core.audit import record as audit

            email = response.data.get("user", {}).get("email")
            if email:
                user = User.objects.filter(email=email).first()
                ip = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
                ip = ip or request.META.get("REMOTE_ADDR")
                audit("login", actor=user, target=user, ip_address=ip or None)
        return response


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklist the supplied refresh token."""

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            RefreshToken(refresh).blacklist()
        except Exception:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    """GET / PATCH /api/auth/me/ — fetch or update the current user."""

    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return UserUpdateSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(UserSerializer(self.get_object()).data)


class MemberProfileView(generics.RetrieveUpdateAPIView):
    """GET / PATCH /api/auth/me/member-profile/ — only for members."""

    permission_classes = (IsAuthenticated,)
    serializer_class = MemberProfileSerializer

    def get_object(self):
        profile, _ = MemberProfile.objects.get_or_create(user=self.request.user)
        return profile


class QuestionnaireView(generics.UpdateAPIView):
    """PATCH/PUT /api/auth/me/questionnaire/ — onboarding flow."""

    permission_classes = (IsAuthenticated,)
    serializer_class = QuestionnaireSerializer

    def get_object(self):
        profile, _ = MemberProfile.objects.get_or_create(user=self.request.user)
        return profile

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(MemberProfileSerializer(self.get_object()).data)


class CoachProfileView(generics.RetrieveUpdateAPIView):
    """GET / PATCH /api/auth/me/coach-profile/ — only for coaches."""

    permission_classes = (IsAuthenticated,)
    serializer_class = CoachProfileSerializer

    def get_object(self):
        profile, _ = CoachProfile.objects.get_or_create(user=self.request.user)
        return profile
