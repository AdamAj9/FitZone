from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.bookings.models import Booking
from apps.courses.models import Category, Course
from apps.payments.models import Payment
from apps.sessions_app.models import CourseSession, Room
from apps.subscriptions.models import Subscription, SubscriptionPlan

from .audit import record as audit
from .models import AuditLog

User = get_user_model()


class AuditAccessTests(APITestCase):
    def setUp(self):
        self.member = User.objects.create_user(
            email="m@e.com", password="Strong-Pass-123!"
        )
        self.admin = User.objects.create_superuser(
            email="a@e.com", password="Strong-Pass-123!"
        )

    def test_anonymous_blocked(self):
        response = self.client.get(reverse("admin-logs-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_member_forbidden(self):
        self.client.force_authenticate(self.member)
        response = self.client.get(reverse("admin-logs-list"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_list_logs(self):
        audit("login", actor=self.admin, target=self.admin)
        self.client.force_authenticate(self.admin)
        response = self.client.get(reverse("admin-logs-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 1)


class SignalTests(APITestCase):
    def test_register_writes_audit_log(self):
        self.client.post(
            reverse("auth-register"),
            {
                "email": "z@e.com",
                "password": "Strong-Pass-123!",
                "password_confirm": "Strong-Pass-123!",
                "first_name": "Z",
                "last_name": "Z",
            },
            format="json",
        )
        self.assertTrue(AuditLog.objects.filter(action="register").exists())

    def test_login_writes_audit_log(self):
        User.objects.create_user(email="l@e.com", password="Strong-Pass-123!")
        self.client.post(
            reverse("auth-login"),
            {"email": "l@e.com", "password": "Strong-Pass-123!"},
            format="json",
        )
        self.assertTrue(AuditLog.objects.filter(action="login").exists())

    def test_subscription_activate_writes_audit_log(self):
        plan = SubscriptionPlan.objects.create(
            slug="basic-monthly",
            name="Basic Mensuel",
            tier="basic",
            period="monthly",
            price="29.99",
        )
        user = User.objects.create_user(email="s@e.com", password="Strong-Pass-123!")
        sub = Subscription.objects.create(user=user, plan=plan, price_paid="29.99")
        sub.activate()
        self.assertTrue(
            AuditLog.objects.filter(action="sub_activated", actor=user).exists()
        )

    def test_payment_success_writes_audit_log(self):
        user = User.objects.create_user(email="p@e.com", password="Strong-Pass-123!")
        payment = Payment.objects.create(
            user=user, kind=Payment.Kind.SUBSCRIPTION, amount="29.99"
        )
        payment.mark_succeeded()
        self.assertTrue(
            AuditLog.objects.filter(action="pay_succeeded", actor=user).exists()
        )


class AdminUserManagementTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email="a@e.com", password="Strong-Pass-123!"
        )
        self.client.force_authenticate(self.admin)
        self.target = User.objects.create_user(
            email="t@e.com", password="Strong-Pass-123!"
        )

    def test_list_users(self):
        response = self.client.get(reverse("admin-users-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 2)

    def test_filter_by_role(self):
        coach = User.objects.create_user(
            email="c@e.com", password="Strong-Pass-123!", role=User.Role.COACH
        )
        response = self.client.get(reverse("admin-users-list"), {"role": "coach"})
        ids = [u["id"] for u in response.data["results"]]
        self.assertIn(coach.id, ids)
        self.assertNotIn(self.target.id, ids)

    def test_toggle_active(self):
        response = self.client.post(
            reverse("admin-users-toggle-active", kwargs={"pk": self.target.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.target.refresh_from_db()
        self.assertFalse(self.target.is_active)
        self.assertTrue(
            AuditLog.objects.filter(action="admin_user_toggled").exists()
        )

    def test_cannot_toggle_self(self):
        response = self.client.post(
            reverse("admin-users-toggle-active", kwargs={"pk": self.admin.id})
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_set_role(self):
        response = self.client.post(
            reverse("admin-users-set-role", kwargs={"pk": self.target.id}),
            {"role": "coach"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.target.refresh_from_db()
        self.assertEqual(self.target.role, "coach")
        self.assertTrue(
            AuditLog.objects.filter(action="admin_user_role_changed").exists()
        )

    def test_set_role_rejects_invalid(self):
        response = self.client.post(
            reverse("admin-users-set-role", kwargs={"pk": self.target.id}),
            {"role": "wizard"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AdminDashboardTests(APITestCase):
    def test_member_blocked(self):
        member = User.objects.create_user(
            email="m@e.com", password="Strong-Pass-123!"
        )
        self.client.force_authenticate(member)
        response = self.client.get(reverse("admin-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_dashboard_returns_kpis(self):
        admin = User.objects.create_superuser(
            email="a@e.com", password="Strong-Pass-123!"
        )
        # Create some data
        User.objects.create_user(email="u1@e.com", password="Strong-Pass-123!")
        coach = User.objects.create_user(
            email="c@e.com", password="Strong-Pass-123!", role=User.Role.COACH
        )
        cat = Category.objects.create(name="Fitness")
        course = Course.objects.create(title="X", category=cat, coach=coach)
        Payment.objects.create(
            user=admin,
            kind=Payment.Kind.SUBSCRIPTION,
            amount="100.00",
            status=Payment.Status.SUCCEEDED,
        )

        self.client.force_authenticate(admin)
        response = self.client.get(reverse("admin-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["users"]["total"], 3)
        self.assertEqual(response.data["users"]["coaches"], 1)
        self.assertIn("revenue_last_30_days", response.data)
        _ = course
