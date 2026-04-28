from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    BookingViewSet,
    CoachBookingsView,
    CoachDashboardView,
    MyStatsView,
    RecommendationsView,
)

router = DefaultRouter()
router.register("bookings", BookingViewSet, basename="bookings")

urlpatterns = router.urls + [
    path("me/stats/", MyStatsView.as_view(), name="me-stats"),
    path(
        "me/recommendations/",
        RecommendationsView.as_view(),
        name="me-recommendations",
    ),
    path(
        "coach/dashboard/",
        CoachDashboardView.as_view(),
        name="coach-dashboard",
    ),
    path(
        "coach/bookings/",
        CoachBookingsView.as_view(),
        name="coach-bookings",
    ),
]
