from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CoachProfileView,
    LoginView,
    LogoutView,
    MeView,
    MemberProfileView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path(
        "me/member-profile/",
        MemberProfileView.as_view(),
        name="auth-member-profile",
    ),
    path(
        "me/coach-profile/",
        CoachProfileView.as_view(),
        name="auth-coach-profile",
    ),
]
