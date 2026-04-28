from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.bookings.models import Booking
from apps.courses.models import Category, Course
from apps.sessions_app.models import CourseSession, Room

from . import services
from .models import Rating

User = get_user_model()


def _past_session(course, room, hours_ago=2):
    starts = timezone.now() - timedelta(hours=hours_ago)
    return CourseSession.objects.create(
        course=course,
        coach=course.coach,
        room=room,
        starts_at=starts,
        ends_at=starts + timedelta(hours=1),
        capacity=10,
    )


def _future_session(course, room):
    starts = timezone.now() + timedelta(days=1)
    return CourseSession.objects.create(
        course=course,
        coach=course.coach,
        room=room,
        starts_at=starts,
        ends_at=starts + timedelta(hours=1),
        capacity=10,
    )


class RatingEligibilityTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat = Category.objects.create(name="Fitness")
        cls.coach = User.objects.create_user(
            email="c@e.com", password="Strong-Pass-123!", role=User.Role.COACH
        )
        cls.other_coach = User.objects.create_user(
            email="o@e.com", password="Strong-Pass-123!", role=User.Role.COACH
        )
        cls.member = User.objects.create_user(
            email="m@e.com", password="Strong-Pass-123!"
        )
        cls.course = Course.objects.create(
            title="X", category=cls.cat, coach=cls.coach
        )

    def test_cannot_rate_self(self):
        with self.assertRaises(services.RatingError):
            services.assert_can_rate(member=self.coach, coach=self.coach)

    def test_cannot_rate_a_member(self):
        with self.assertRaises(services.RatingError):
            services.assert_can_rate(member=self.member, coach=self.member)

    def test_blocks_when_no_attended_session(self):
        with self.assertRaises(services.RatingError):
            services.assert_can_rate(member=self.member, coach=self.coach)

    def test_blocks_when_only_future_booking(self):
        room = Room.objects.create(name="A")
        session = _future_session(self.course, room)
        Booking.objects.create(
            user=self.member,
            course_session=session,
            channel=Booking.Channel.SUBSCRIPTION,
            status=Booking.Status.CONFIRMED,
        )
        with self.assertRaises(services.RatingError):
            services.assert_can_rate(member=self.member, coach=self.coach)

    def test_allows_after_past_attended_session(self):
        room = Room.objects.create(name="A")
        session = _past_session(self.course, room)
        Booking.objects.create(
            user=self.member,
            course_session=session,
            channel=Booking.Channel.SUBSCRIPTION,
            status=Booking.Status.CONFIRMED,
        )
        services.assert_can_rate(member=self.member, coach=self.coach)


class RatingApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat = Category.objects.create(name="Fitness")
        cls.coach = User.objects.create_user(
            email="c@e.com",
            password="Strong-Pass-123!",
            role=User.Role.COACH,
            first_name="Coach",
            last_name="One",
        )
        cls.member = User.objects.create_user(
            email="m@e.com", password="Strong-Pass-123!"
        )
        cls.member_b = User.objects.create_user(
            email="b@e.com", password="Strong-Pass-123!"
        )
        cls.course = Course.objects.create(
            title="X", category=cls.cat, coach=cls.coach
        )
        cls.room = Room.objects.create(name="A")
        cls.past = _past_session(cls.course, cls.room)
        Booking.objects.create(
            user=cls.member,
            course_session=cls.past,
            channel=Booking.Channel.SUBSCRIPTION,
            status=Booking.Status.CONFIRMED,
        )
        Booking.objects.create(
            user=cls.member_b,
            course_session=cls.past,
            channel=Booking.Channel.SUBSCRIPTION,
            status=Booking.Status.CONFIRMED,
        )

    def test_anonymous_can_list_ratings(self):
        Rating.objects.create(member=self.member, coach=self.coach, score=5)
        response = self.client.get(reverse("ratings-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_filter_by_coach(self):
        other_coach = User.objects.create_user(
            email="oc@e.com",
            password="Strong-Pass-123!",
            role=User.Role.COACH,
        )
        Rating.objects.create(member=self.member, coach=self.coach, score=4)
        response = self.client.get(reverse("ratings-list"), {"coach": self.coach.id})
        self.assertEqual(response.data["count"], 1)
        response = self.client.get(
            reverse("ratings-list"), {"coach": other_coach.id}
        )
        self.assertEqual(response.data["count"], 0)

    def test_anonymous_cannot_create(self):
        response = self.client.post(
            reverse("ratings-list"),
            {"coach": self.coach.id, "score": 5},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_member_with_attendance_can_create(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(
            reverse("ratings-list"),
            {"coach": self.coach.id, "score": 5, "comment": "Great"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rating.objects.count(), 1)

    def test_member_without_attendance_blocked(self):
        outsider = User.objects.create_user(
            email="x@e.com", password="Strong-Pass-123!"
        )
        self.client.force_authenticate(outsider)
        response = self.client.post(
            reverse("ratings-list"),
            {"coach": self.coach.id, "score": 5},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_duplicate_rating_blocked(self):
        Rating.objects.create(member=self.member, coach=self.coach, score=5)
        self.client.force_authenticate(self.member)
        response = self.client.post(
            reverse("ratings-list"),
            {"coach": self.coach.id, "score": 4},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_score_out_of_range_rejected(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(
            reverse("ratings-list"),
            {"coach": self.coach.id, "score": 7},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_can_update_own_rating(self):
        rating = Rating.objects.create(
            member=self.member, coach=self.coach, score=3
        )
        self.client.force_authenticate(self.member)
        response = self.client.patch(
            reverse("ratings-detail", kwargs={"pk": rating.id}),
            {"score": 5, "comment": "Updated"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rating.refresh_from_db()
        self.assertEqual(rating.score, 5)

    def test_cannot_update_others_rating(self):
        rating = Rating.objects.create(
            member=self.member, coach=self.coach, score=3
        )
        self.client.force_authenticate(self.member_b)
        response = self.client.patch(
            reverse("ratings-detail", kwargs={"pk": rating.id}),
            {"score": 1},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_can_delete_own_rating(self):
        rating = Rating.objects.create(
            member=self.member, coach=self.coach, score=4
        )
        self.client.force_authenticate(self.member)
        response = self.client.delete(
            reverse("ratings-detail", kwargs={"pk": rating.id})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Rating.objects.filter(id=rating.id).exists())

    def test_mine_endpoint_returns_only_mine(self):
        Rating.objects.create(member=self.member, coach=self.coach, score=4)
        Rating.objects.create(member=self.member_b, coach=self.coach, score=2)
        self.client.force_authenticate(self.member)
        response = self.client.get(reverse("ratings-mine"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        results = data["results"] if isinstance(data, dict) else data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["coach"], self.coach.id)


class CoachRatingAggregationTests(APITestCase):
    def test_coach_endpoint_includes_average_and_count(self):
        coach = User.objects.create_user(
            email="c@e.com", password="Strong-Pass-123!", role=User.Role.COACH
        )
        m1 = User.objects.create_user(email="m1@e.com", password="Strong-Pass-123!")
        m2 = User.objects.create_user(email="m2@e.com", password="Strong-Pass-123!")
        Rating.objects.create(member=m1, coach=coach, score=5)
        Rating.objects.create(member=m2, coach=coach, score=3)

        response = self.client.get(
            reverse("coaches-detail", kwargs={"pk": coach.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["rating_count"], 2)
        self.assertEqual(response.data["rating_average"], 4.0)

    def test_coach_with_no_ratings_returns_null_average(self):
        coach = User.objects.create_user(
            email="c@e.com", password="Strong-Pass-123!", role=User.Role.COACH
        )
        response = self.client.get(
            reverse("coaches-detail", kwargs={"pk": coach.id})
        )
        self.assertEqual(response.data["rating_count"], 0)
        self.assertIsNone(response.data["rating_average"])
