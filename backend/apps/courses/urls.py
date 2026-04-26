from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, CoachViewSet, CourseViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="categories")
router.register("courses", CourseViewSet, basename="courses")
router.register("coaches", CoachViewSet, basename="coaches")

urlpatterns = router.urls
