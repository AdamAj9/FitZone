from rest_framework.routers import DefaultRouter

from .views import CourseSessionViewSet, RoomViewSet

router = DefaultRouter()
router.register("rooms", RoomViewSet, basename="rooms")
router.register("sessions", CourseSessionViewSet, basename="sessions")

urlpatterns = router.urls
