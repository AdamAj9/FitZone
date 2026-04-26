from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CheckoutCourseView,
    CheckoutSubscriptionView,
    PaymentViewSet,
    StripeWebhookView,
)

router = DefaultRouter()
router.register("payments", PaymentViewSet, basename="payments")

urlpatterns = router.urls + [
    path(
        "payments/checkout/subscription/",
        CheckoutSubscriptionView.as_view(),
        name="checkout-subscription",
    ),
    path(
        "payments/checkout/course/",
        CheckoutCourseView.as_view(),
        name="checkout-course",
    ),
    path(
        "payments/webhook/stripe/",
        StripeWebhookView.as_view(),
        name="stripe-webhook",
    ),
]
