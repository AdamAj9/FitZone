from rest_framework.routers import DefaultRouter

from .views import SubscriptionPlanViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register("plans", SubscriptionPlanViewSet, basename="plans")
router.register("subscriptions", SubscriptionViewSet, basename="subscriptions")

urlpatterns = router.urls
