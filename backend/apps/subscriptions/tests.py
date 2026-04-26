from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Subscription, SubscriptionPlan

User = get_user_model()


def make_plan(slug="basic-monthly", price="29.99", period="monthly", tier="basic"):
    return SubscriptionPlan.objects.create(
        slug=slug,
        name=slug,
        tier=tier,
        period=period,
        price=price,
    )


class PlanApiTests(APITestCase):
    def test_anonymous_can_list_plans(self):
        make_plan()
        make_plan(slug="premium-yearly", price="599.00", period="yearly", tier="premium")
        response = self.client.get(reverse("plans-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_inactive_plan_hidden(self):
        plan = make_plan()
        plan.is_active = False
        plan.save()
        response = self.client.get(reverse("plans-list"))
        self.assertEqual(response.data["count"], 0)


class SubscriptionLifecycleTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.plan = make_plan()
        cls.user = User.objects.create_user(
            email="m@example.com", password="Strong-Pass-123!"
        )

    def test_activate_sets_dates_and_status(self):
        sub = Subscription.objects.create(
            user=self.user, plan=self.plan, price_paid=self.plan.price
        )
        before = timezone.now()
        sub.activate()
        sub.refresh_from_db()
        self.assertEqual(sub.status, Subscription.Status.ACTIVE)
        self.assertGreaterEqual(sub.starts_at, before - timedelta(seconds=2))
        self.assertEqual((sub.ends_at - sub.starts_at).days, 30)

    def test_cancel_active_sets_cancelled_at(self):
        sub = Subscription.objects.create(
            user=self.user, plan=self.plan, price_paid=self.plan.price
        )
        sub.activate()
        sub.cancel()
        sub.refresh_from_db()
        self.assertEqual(sub.status, Subscription.Status.CANCELLED)
        self.assertIsNotNone(sub.cancelled_at)

    def test_expire_lapsed_marks_overdue_active_as_expired(self):
        sub = Subscription.objects.create(
            user=self.user,
            plan=self.plan,
            price_paid=self.plan.price,
            status=Subscription.Status.ACTIVE,
            starts_at=timezone.now() - timedelta(days=40),
            ends_at=timezone.now() - timedelta(days=10),
        )
        Subscription.expire_lapsed()
        sub.refresh_from_db()
        self.assertEqual(sub.status, Subscription.Status.EXPIRED)


class SubscribeApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.plan = make_plan()
        cls.user = User.objects.create_user(
            email="m@example.com", password="Strong-Pass-123!"
        )

    def test_unauthenticated_cannot_subscribe(self):
        response = self.client.post(
            reverse("subscriptions-subscribe"), {"plan_id": self.plan.id}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_subscribe_creates_active_subscription(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("subscriptions-subscribe"),
            {"plan_id": self.plan.id, "activate_now": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "active")
        self.assertEqual(Subscription.objects.count(), 1)

    def test_cannot_subscribe_when_already_active(self):
        self.client.force_authenticate(self.user)
        self.client.post(
            reverse("subscriptions-subscribe"),
            {"plan_id": self.plan.id, "activate_now": True},
            format="json",
        )
        response = self.client.post(
            reverse("subscriptions-subscribe"),
            {"plan_id": self.plan.id, "activate_now": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("active subscription", response.data.get("detail", ""))

    def test_subscribe_unknown_plan_returns_400(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("subscriptions-subscribe"), {"plan_id": 9999}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SubscriptionListAndCurrentTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.plan = make_plan()
        cls.user = User.objects.create_user(
            email="m@example.com", password="Strong-Pass-123!"
        )
        cls.other = User.objects.create_user(
            email="o@example.com", password="Strong-Pass-123!"
        )

    def test_list_only_returns_my_subscriptions(self):
        Subscription.objects.create(user=self.user, plan=self.plan, price_paid="29.99")
        Subscription.objects.create(user=self.other, plan=self.plan, price_paid="29.99")
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("subscriptions-list"))
        self.assertEqual(response.data["count"], 1)

    def test_current_returns_null_when_none_active(self):
        Subscription.objects.create(user=self.user, plan=self.plan, price_paid="29.99")
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("subscriptions-current"))
        self.assertIsNone(response.data["subscription"])

    def test_current_returns_active(self):
        sub = Subscription.objects.create(
            user=self.user, plan=self.plan, price_paid="29.99"
        )
        sub.activate()
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("subscriptions-current"))
        self.assertEqual(response.data["subscription"]["id"], sub.id)

    def test_cancel_endpoint(self):
        sub = Subscription.objects.create(
            user=self.user, plan=self.plan, price_paid="29.99"
        )
        sub.activate()
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("subscriptions-cancel", kwargs={"pk": sub.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "cancelled")
