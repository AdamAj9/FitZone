from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.courses.models import Category, Course
from apps.subscriptions.models import Subscription, SubscriptionPlan

from . import services
from .models import Payment

User = get_user_model()


def fake_session(payment):
    """Mimic stripe.checkout.Session.create. Stamps the payment and returns
    a session-like dict that the service layer expects."""
    session_id = f"cs_test_{payment.id}"
    payment.stripe_session_id = session_id
    payment.save(update_fields=["stripe_session_id"])
    return {
        "id": session_id,
        "url": f"https://checkout.stripe.test/{session_id}",
    }


class CheckoutTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            email="m@example.com", password="Strong-Pass-123!"
        )
        cls.plan = SubscriptionPlan.objects.create(
            slug="basic-monthly",
            name="Basic Mensuel",
            tier="basic",
            period="monthly",
            price="29.99",
        )
        cls.cat = Category.objects.create(name="Fitness")
        cls.paid_course = Course.objects.create(
            title="HIIT", category=cls.cat, price_unit="12.00"
        )
        cls.free_course = Course.objects.create(
            title="Open gym", category=cls.cat, price_unit="0"
        )

    def setUp(self):
        self.client.force_authenticate(self.user)

    def _patch_session(self):
        return patch.object(
            services,
            "_session_create",
            side_effect=lambda **kwargs: fake_session(
                Payment.objects.get(id=kwargs["metadata"]["payment_id"])
            ),
        )

    def test_subscription_checkout_creates_pending_subscription_and_payment(self):
        with self._patch_session():
            response = self.client.post(
                reverse("checkout-subscription"),
                {"plan_id": self.plan.id},
                format="json",
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("checkout_url", response.data)
        sub = Subscription.objects.get(user=self.user)
        self.assertEqual(sub.status, Subscription.Status.PENDING)
        payment = Payment.objects.get(subscription=sub)
        self.assertEqual(payment.status, Payment.Status.PENDING)
        self.assertEqual(payment.amount, Decimal("29.99"))

    def test_subscription_checkout_blocked_when_already_active(self):
        sub = Subscription.objects.create(
            user=self.user, plan=self.plan, price_paid="29.99"
        )
        sub.activate()
        with self._patch_session():
            response = self.client.post(
                reverse("checkout-subscription"),
                {"plan_id": self.plan.id},
                format="json",
            )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_course_checkout_rejects_free_course(self):
        with self._patch_session():
            response = self.client.post(
                reverse("checkout-course"),
                {"course_id": self.free_course.id},
                format="json",
            )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_course_checkout_creates_payment(self):
        with self._patch_session():
            response = self.client.post(
                reverse("checkout-course"),
                {"course_id": self.paid_course.id},
                format="json",
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        payment = Payment.objects.get(course=self.paid_course, user=self.user)
        self.assertEqual(payment.status, Payment.Status.PENDING)
        self.assertEqual(payment.amount, Decimal("12.00"))

    def test_unauthenticated_cannot_checkout(self):
        self.client.force_authenticate(None)
        response = self.client.post(
            reverse("checkout-subscription"),
            {"plan_id": self.plan.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class WebhookTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            email="m@example.com", password="Strong-Pass-123!"
        )
        cls.plan = SubscriptionPlan.objects.create(
            slug="basic-monthly",
            name="Basic Mensuel",
            tier="basic",
            period="monthly",
            price="29.99",
        )

    def _make_pending_subscription_payment(self):
        sub = Subscription.objects.create(
            user=self.user, plan=self.plan, price_paid="29.99"
        )
        return Payment.objects.create(
            user=self.user,
            kind=Payment.Kind.SUBSCRIPTION,
            subscription=sub,
            amount="29.99",
            stripe_session_id="cs_test_123",
        )

    def _post_event(self, event):
        with patch("apps.payments.views.stripe.Webhook.construct_event", return_value=event):
            return self.client.post(
                reverse("stripe-webhook"),
                data=b"{}",
                content_type="application/json",
                HTTP_STRIPE_SIGNATURE="t=fake",
            )

    def test_checkout_completed_activates_subscription(self):
        payment = self._make_pending_subscription_payment()
        event = {
            "id": "evt_1",
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": payment.stripe_session_id,
                    "payment_intent": "pi_123",
                    "metadata": {"payment_id": str(payment.id)},
                }
            },
        }
        response = self._post_event(event)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payment.refresh_from_db()
        payment.subscription.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.SUCCEEDED)
        self.assertEqual(
            payment.subscription.status, Subscription.Status.ACTIVE
        )
        self.assertEqual(payment.stripe_event_id, "evt_1")

    def test_checkout_completed_is_idempotent(self):
        payment = self._make_pending_subscription_payment()
        event = {
            "id": "evt_1",
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": payment.stripe_session_id,
                    "metadata": {"payment_id": str(payment.id)},
                }
            },
        }
        self._post_event(event)
        first_updated = Payment.objects.get(id=payment.id).updated_at
        response = self._post_event(event)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            Payment.objects.get(id=payment.id).updated_at, first_updated
        )

    def test_payment_failed_marks_payment_failed(self):
        payment = self._make_pending_subscription_payment()
        payment.stripe_payment_intent = "pi_456"
        payment.save()
        event = {
            "id": "evt_2",
            "type": "payment_intent.payment_failed",
            "data": {"object": {"id": "pi_456"}},
        }
        response = self._post_event(event)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.FAILED)

    def test_unknown_event_type_returns_200(self):
        event = {"id": "evt_x", "type": "customer.created", "data": {"object": {}}}
        response = self._post_event(event)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PaymentListTests(APITestCase):
    def test_list_only_returns_my_payments(self):
        plan = SubscriptionPlan.objects.create(
            slug="basic-monthly",
            name="Basic Mensuel",
            tier="basic",
            period="monthly",
            price="29.99",
        )
        me = User.objects.create_user(email="me@e.com", password="Strong-Pass-123!")
        other = User.objects.create_user(email="o@e.com", password="Strong-Pass-123!")
        Payment.objects.create(user=me, kind="subscription", amount="29.99")
        Payment.objects.create(user=other, kind="subscription", amount="29.99")
        _ = plan
        self.client.force_authenticate(me)
        response = self.client.get(reverse("payments-list"))
        self.assertEqual(response.data["count"], 1)
