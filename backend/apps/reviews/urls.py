from rest_framework.routers import DefaultRouter

from .views import RatingViewSet

router = DefaultRouter()
router.register("ratings", RatingViewSet, basename="ratings")

urlpatterns = router.urls
