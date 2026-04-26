from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.courses.models import Category, Course

from .models import CourseSession, Room

User = get_user_model()


def _aware(dt):
    return timezone.make_aware(dt, timezone.get_current_timezone())


class SessionModelTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat = Category.objects.create(name="Fitness")
        cls.coach = User.objects.create_user(
            email="coach@example.com",
            password="Strong-Pass-123!",
            role=User.Role.COACH,
        )
        cls.course = Course.objects.create(
            title="Yoga", category=cls.cat, coach=cls.coach, capacity=15
        )
        cls.room = Room.objects.create(name="A", capacity=20)

    def test_capacity_defaults_to_course_capacity(self):
        starts = timezone.now() + timedelta(days=1)
        s = CourseSession.objects.create(
            course=self.course,
            room=self.room,
            starts_at=starts,
            ends_at=starts + timedelta(hours=1),
        )
        self.assertEqual(s.capacity, 15)
        self.assertEqual(s.coach, self.coach)

    def test_clean_rejects_end_before_start(self):
        starts = timezone.now() + timedelta(days=1)
        s = CourseSession(
            course=self.course,
            room=self.room,
            starts_at=starts,
            ends_at=starts - timedelta(minutes=10),
            capacity=10,
        )
        with self.assertRaises(ValidationError):
            s.clean()

    def test_clean_rejects_room_overlap(self):
        starts = timezone.now() + timedelta(days=1)
        CourseSession.objects.create(
            course=self.course,
            room=self.room,
            starts_at=starts,
            ends_at=starts + timedelta(hours=1),
        )
        overlap = CourseSession(
            course=self.course,
            room=self.room,
            starts_at=starts + timedelta(minutes=30),
            ends_at=starts + timedelta(minutes=90),
            capacity=10,
        )
        with self.assertRaises(ValidationError):
            overlap.clean()


class SessionApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat = Category.objects.create(name="Fitness")
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
        cls.member = User.objects.create_user(
            email="m@example.com", password="Strong-Pass-123!"
        )
        cls.admin = User.objects.create_superuser(
            email="admin@example.com", password="Strong-Pass-123!"
        )
        cls.course_a = Course.objects.create(
            title="Course A", category=cls.cat, coach=cls.coach_a
        )
        cls.room = Room.objects.create(name="Studio", capacity=20)

        today = timezone.localdate()
        cls.start_today = _aware(timezone.datetime.combine(today, timezone.datetime.min.time()) + timedelta(hours=10))
        cls.start_tomorrow = cls.start_today + timedelta(days=1)
        cls.session_today = CourseSession.objects.create(
            course=cls.course_a,
            coach=cls.coach_a,
            room=cls.room,
            starts_at=cls.start_today,
            ends_at=cls.start_today + timedelta(hours=1),
        )
        cls.session_cancelled = CourseSession.objects.create(
            course=cls.course_a,
            coach=cls.coach_a,
            room=cls.room,
            starts_at=cls.start_tomorrow,
            ends_at=cls.start_tomorrow + timedelta(hours=1),
            status=CourseSession.Status.CANCELLED,
        )

    def test_anonymous_list_excludes_cancelled(self):
        response = self.client.get(reverse("sessions-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {s["id"] for s in response.data["results"]}
        self.assertIn(self.session_today.id, ids)
        self.assertNotIn(self.session_cancelled.id, ids)

    def test_admin_sees_cancelled(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(reverse("sessions-list"))
        ids = {s["id"] for s in response.data["results"]}
        self.assertIn(self.session_cancelled.id, ids)

    def test_filter_by_date_range(self):
        date = self.start_today.date().isoformat()
        response = self.client.get(reverse("sessions-list"), {"from": date, "to": date})
        slugs = [s["course_slug"] for s in response.data["results"]]
        self.assertEqual(slugs, ["course-a"])

    def test_filter_by_course_slug(self):
        response = self.client.get(
            reverse("sessions-list"), {"course__slug": "course-a"}
        )
        self.assertEqual(response.data["count"], 1)

    def test_member_cannot_create_session(self):
        self.client.force_authenticate(self.member)
        starts = timezone.now() + timedelta(days=2)
        response = self.client.post(
            reverse("sessions-list"),
            {
                "course": self.course_a.id,
                "room": self.room.id,
                "starts_at": starts.isoformat(),
                "ends_at": (starts + timedelta(hours=1)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_coach_cannot_create_for_other_coach_course(self):
        self.client.force_authenticate(self.coach_b)
        starts = timezone.now() + timedelta(days=2)
        response = self.client.post(
            reverse("sessions-list"),
            {
                "course": self.course_a.id,
                "room": self.room.id,
                "starts_at": starts.isoformat(),
                "ends_at": (starts + timedelta(hours=1)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_coach_creates_session_for_own_course(self):
        self.client.force_authenticate(self.coach_a)
        starts = timezone.now() + timedelta(days=2)
        response = self.client.post(
            reverse("sessions-list"),
            {
                "course": self.course_a.id,
                "room": self.room.id,
                "starts_at": starts.isoformat(),
                "ends_at": (starts + timedelta(hours=1)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class RoomApiTests(APITestCase):
    def test_list_returns_active_rooms(self):
        Room.objects.create(name="A")
        Room.objects.create(name="B", is_active=False)
        response = self.client.get(reverse("rooms-list"))
        names = {r["name"] for r in response.data["results"]}
        self.assertEqual(names, {"A"})
