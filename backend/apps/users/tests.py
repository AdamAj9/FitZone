from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CoachProfile, MemberProfile

User = get_user_model()


class RegistrationTests(APITestCase):
    def test_register_creates_member_user_and_profile(self):
        url = reverse("auth-register")
        response = self.client.post(
            url,
            {
                "email": "alice@example.com",
                "password": "Strong-Pass-123!",
                "password_confirm": "Strong-Pass-123!",
                "first_name": "Alice",
                "last_name": "Doe",
                "preferred_language": "fr",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "alice@example.com")
        self.assertEqual(response.data["user"]["role"], "member")

        user = User.objects.get(email="alice@example.com")
        self.assertEqual(user.role, User.Role.MEMBER)
        self.assertTrue(MemberProfile.objects.filter(user=user).exists())

    def test_register_password_mismatch(self):
        url = reverse("auth-register")
        response = self.client.post(
            url,
            {
                "email": "bob@example.com",
                "password": "Strong-Pass-123!",
                "password_confirm": "Different-Pass-123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", response.data)


class AuthFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="carol@example.com", password="Strong-Pass-123!"
        )

    def test_login_returns_tokens_and_user(self):
        response = self.client.post(
            reverse("auth-login"),
            {"email": "carol@example.com", "password": "Strong-Pass-123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "carol@example.com")

    def test_login_invalid_credentials(self):
        response = self.client.post(
            reverse("auth-login"),
            {"email": "carol@example.com", "password": "wrong"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_auth(self):
        response = self.client.get(reverse("auth-me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_user_when_authenticated(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("auth-me"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "carol@example.com")

    def test_me_patch_updates_first_name(self):
        self.client.force_authenticate(self.user)
        response = self.client.patch(
            reverse("auth-me"), {"first_name": "Carol"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Carol")
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Carol")

    def test_logout_blacklists_refresh_token(self):
        login = self.client.post(
            reverse("auth-login"),
            {"email": "carol@example.com", "password": "Strong-Pass-123!"},
            format="json",
        )
        refresh = login.data["refresh"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        response = self.client.post(
            reverse("auth-logout"), {"refresh": refresh}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)


class ChangePasswordTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="dana@example.com", password="Old-Pass-123!"
        )
        self.client.force_authenticate(self.user)
        self.url = reverse("auth-change-password")

    def test_change_password_success(self):
        response = self.client.post(
            self.url,
            {
                "current_password": "Old-Pass-123!",
                "new_password": "New-Pass-456!",
                "new_password_confirm": "New-Pass-456!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("New-Pass-456!"))

    def test_change_password_wrong_current_password(self):
        response = self.client.post(
            self.url,
            {
                "current_password": "Wrong-Pass",
                "new_password": "New-Pass-456!",
                "new_password_confirm": "New-Pass-456!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("current_password", response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Old-Pass-123!"))

    def test_change_password_mismatch(self):
        response = self.client.post(
            self.url,
            {
                "current_password": "Old-Pass-123!",
                "new_password": "New-Pass-456!",
                "new_password_confirm": "Different-789!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password_confirm", response.data)

    def test_change_password_too_weak(self):
        response = self.client.post(
            self.url,
            {
                "current_password": "Old-Pass-123!",
                "new_password": "short",
                "new_password_confirm": "short",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)

    def test_change_password_requires_auth(self):
        self.client.force_authenticate(None)
        response = self.client.post(
            self.url,
            {
                "current_password": "Old-Pass-123!",
                "new_password": "New-Pass-456!",
                "new_password_confirm": "New-Pass-456!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileSignalTests(APITestCase):
    def test_member_profile_created_via_signal(self):
        user = User.objects.create_user(
            email="member@example.com", password="Strong-Pass-123!"
        )
        self.assertTrue(MemberProfile.objects.filter(user=user).exists())

    def test_coach_profile_created_via_signal(self):
        user = User.objects.create_user(
            email="coach@example.com",
            password="Strong-Pass-123!",
            role=User.Role.COACH,
        )
        self.assertTrue(CoachProfile.objects.filter(user=user).exists())
