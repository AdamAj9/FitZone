from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Course

User = get_user_model()


class CategoryApiTests(APITestCase):
    def setUp(self):
        Category.objects.create(name="Fitness")
        Category.objects.create(name="Pool")
        Category.objects.create(name="Hidden", is_active=False)

    def test_list_returns_only_active_categories(self):
        response = self.client.get(reverse("categories-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = {c["name"] for c in response.data["results"]}
        self.assertEqual(names, {"Fitness", "Pool"})

    def test_slug_auto_generated(self):
        cat = Category.objects.get(name="Fitness")
        self.assertEqual(cat.slug, "fitness")


class CoursePublicApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat_fitness = Category.objects.create(name="Fitness")
        cls.cat_pool = Category.objects.create(name="Pool")
        cls.coach = User.objects.create_user(
            email="coach@example.com",
            password="Strong-Pass-123!",
            role=User.Role.COACH,
            first_name="Coach",
            last_name="One",
        )
        cls.course_active = Course.objects.create(
            title="Yoga", category=cls.cat_fitness, coach=cls.coach
        )
        cls.course_inactive = Course.objects.create(
            title="Old Class",
            category=cls.cat_fitness,
            coach=cls.coach,
            is_active=False,
        )

    def test_list_public_excludes_inactive(self):
        response = self.client.get(reverse("courses-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = {c["slug"] for c in response.data["results"]}
        self.assertIn("yoga", slugs)
        self.assertNotIn("old-class", slugs)

    def test_detail_includes_coach_payload(self):
        response = self.client.get(
            reverse("courses-detail", kwargs={"slug": "yoga"})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["coach"]["full_name"], "Coach One")
        self.assertEqual(response.data["category"]["name"], "Fitness")

    def test_filter_by_category(self):
        response = self.client.get(
            reverse("courses-list"), {"category__slug": "pool"}
        )
        self.assertEqual(response.data["count"], 0)

    def test_search_by_title(self):
        response = self.client.get(reverse("courses-list"), {"search": "yog"})
        self.assertEqual(response.data["count"], 1)


class CourseWritePermissionTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat = Category.objects.create(name="Fitness")
        cls.member = User.objects.create_user(
            email="m@example.com", password="Strong-Pass-123!"
        )
        cls.coach_a = User.objects.create_user(
            email="ca@example.com",
            password="Strong-Pass-123!",
            role=User.Role.COACH,
        )
        cls.coach_b = User.objects.create_user(
            email="cb@example.com",
            password="Strong-Pass-123!",
            role=User.Role.COACH,
        )
        cls.admin_user = User.objects.create_superuser(
            email="admin@example.com", password="Strong-Pass-123!"
        )
        cls.course_a = Course.objects.create(
            title="Coach A's class", category=cls.cat, coach=cls.coach_a
        )

    def _payload(self):
        return {
            "title": "New class",
            "description": "desc",
            "category": self.cat.id,
            "level": "all",
            "duration_minutes": 45,
            "capacity": 10,
            "price_unit": "12.50",
        }

    def test_member_cannot_create_course(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(
            reverse("courses-list"), self._payload(), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_coach_creates_own_course(self):
        self.client.force_authenticate(self.coach_a)
        response = self.client.post(
            reverse("courses-list"), self._payload(), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            Course.objects.get(slug="new-class").coach_id, self.coach_a.id
        )

    def test_coach_cannot_see_others_in_admin_list(self):
        self.client.force_authenticate(self.coach_b)
        response = self.client.get(reverse("courses-list"))
        slugs = {c["slug"] for c in response.data["results"]}
        self.assertIn("coach-as-class", slugs)

    def test_admin_can_update_any_course(self):
        self.client.force_authenticate(self.admin_user)
        response = self.client.patch(
            reverse("courses-detail", kwargs={"slug": "coach-as-class"}),
            {"capacity": 99},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.course_a.refresh_from_db()
        self.assertEqual(self.course_a.capacity, 99)


class CoachApiTests(APITestCase):
    def test_list_only_returns_coaches(self):
        User.objects.create_user(email="m@e.com", password="Strong-Pass-123!")
        User.objects.create_user(
            email="c@e.com",
            password="Strong-Pass-123!",
            role=User.Role.COACH,
            first_name="Jamy",
            last_name="X",
        )
        response = self.client.get(reverse("coaches-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = [c.get("first_name") for c in response.data["results"]]
        self.assertEqual(emails, ["Jamy"])
