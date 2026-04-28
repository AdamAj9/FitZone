from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.courses.models import Category, Course
from apps.payments.models import Payment
from apps.sessions_app.models import CourseSession, Room
from apps.subscriptions.models import Subscription, SubscriptionPlan

from . import services
from .models import Booking

User = get_user_model()


def _aware(dt):
    return timezone.make_aware(dt, timezone.get_current_timezone())


def _future_session(course, room, hours=24, capacity=2):
    starts = timezone.now() + timedelta(hours=hours)
    return CourseSession.objects.create(
        course=course,
        room=room,
        starts_at=starts,
        ends_at=starts + timedelta(hours=1),
        capacity=capacity,
    )


def _make_premium_sub(user):
    plan = SubscriptionPlan.objects.create(
        slug="premium-monthly",
        name="Premium Mensuel",
        tier="premium",
        period="monthly",
        price="59.99",
        includes_classes=True,
    )
    sub = Subscription.objects.create(user=user, plan=plan, price_paid="59.99")
    sub.activate()
    return sub


def _make_basic_sub(user):
    plan = SubscriptionPlan.objects.create(
        slug="basic-monthly",
        name="Basic Mensuel",
        tier="basic",
        period="monthly",
        price="29.99",
        includes_classes=False,
    )
    sub = Subscription.objects.create(user=user, plan=plan, price_paid="29.99")
    sub.activate()
    return sub


class BookingServiceTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat = Category.objects.create(name="Fitness")
        cls.course = Course.objects.create(
            title="Yoga", category=cls.cat, capacity=2, price_unit="12.00"
        )
        cls.room = Room.objects.create(name="A", capacity=20)

    def test_premium_user_can_book(self):
        user = User.objects.create_user(email="p@e.com", password="Strong-Pass-123!")
        _make_premium_sub(user)
        session = _future_session(self.course, self.room)
        booking = services.book(user=user, course_session_id=session.id)
        self.assertEqual(booking.channel, Booking.Channel.SUBSCRIPTION)

    def test_basic_user_blocked_without_payment(self):
        user = User.objects.create_user(email="b@e.com", password="Strong-Pass-123!")
        _make_basic_sub(user)
        session = _future_session(self.course, self.room)
        with self.assertRaises(services.NoEntitlementError):
            services.book(user=user, course_session_id=session.id)

    def test_no_subscription_blocked(self):
        user = User.objects.create_user(email="n@e.com", password="Strong-Pass-123!")
        session = _future_session(self.course, self.room)
        with self.assertRaises(services.NoEntitlementError):
            services.book(user=user, course_session_id=session.id)

    def test_cannot_book_full_session(self):
        u1 = User.objects.create_user(email="u1@e.com", password="Strong-Pass-123!")
        u2 = User.objects.create_user(email="u2@e.com", password="Strong-Pass-123!")
        u3 = User.objects.create_user(email="u3@e.com", password="Strong-Pass-123!")
        for u in (u1, u2, u3):
            _make_premium_sub_for(u)
        session = _future_session(self.course, self.room, capacity=2)
        services.book(user=u1, course_session_id=session.id)
        services.book(user=u2, course_session_id=session.id)
        with self.assertRaises(services.SessionFullError):
            services.book(user=u3, course_session_id=session.id)

    def test_cannot_double_book(self):
        user = User.objects.create_user(email="d@e.com", password="Strong-Pass-123!")
        _make_premium_sub(user)
        session = _future_session(self.course, self.room)
        services.book(user=user, course_session_id=session.id)
        with self.assertRaises(services.AlreadyBookedError):
            services.book(user=user, course_session_id=session.id)

    def test_cannot_book_past_session(self):
        user = User.objects.create_user(email="pa@e.com", password="Strong-Pass-123!")
        _make_premium_sub(user)
        starts = timezone.now() - timedelta(hours=2)
        session = CourseSession.objects.create(
            course=self.course,
            room=self.room,
            starts_at=starts,
            ends_at=starts + timedelta(hours=1),
            capacity=5,
        )
        with self.assertRaises(services.SessionNotBookableError):
            services.book(user=user, course_session_id=session.id)

    def test_cannot_book_cancelled_session(self):
        user = User.objects.create_user(email="cs@e.com", password="Strong-Pass-123!")
        _make_premium_sub(user)
        session = _future_session(self.course, self.room)
        session.status = CourseSession.Status.CANCELLED
        session.save()
        with self.assertRaises(services.SessionNotBookableError):
            services.book(user=user, course_session_id=session.id)

    def test_payment_path_creates_unit_booking(self):
        user = User.objects.create_user(email="pay@e.com", password="Strong-Pass-123!")
        session = _future_session(self.course, self.room)
        payment = Payment.objects.create(
            user=user,
            kind=Payment.Kind.COURSE,
            course=self.course,
            course_session=session,
            amount="12.00",
            status=Payment.Status.SUCCEEDED,
        )
        booking = services.book(
            user=user, course_session_id=session.id, payment=payment
        )
        self.assertEqual(booking.channel, Booking.Channel.UNIT)
        self.assertEqual(booking.payment_id, payment.id)

    def test_book_for_payment_idempotent(self):
        user = User.objects.create_user(email="bp@e.com", password="Strong-Pass-123!")
        session = _future_session(self.course, self.room)
        payment = Payment.objects.create(
            user=user,
            kind=Payment.Kind.COURSE,
            course=self.course,
            course_session=session,
            amount="12.00",
            status=Payment.Status.SUCCEEDED,
        )
        first = services.book_for_payment(payment)
        second = services.book_for_payment(payment)
        self.assertEqual(first.id, second.id)
        self.assertEqual(
            Booking.objects.filter(payment=payment).count(), 1
        )

    def test_cancel_succeeds_for_future_booking(self):
        user = User.objects.create_user(email="cn@e.com", password="Strong-Pass-123!")
        _make_premium_sub(user)
        session = _future_session(self.course, self.room)
        booking = services.book(user=user, course_session_id=session.id)
        services.cancel(user=user, booking_id=booking.id)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.CANCELLED)
        self.assertIsNotNone(booking.cancelled_at)


def _make_premium_sub_for(user):
    """Helper used inside the per-user loop above — each user gets their own
    plan instance because the fixture above creates a fresh plan per call,
    which would conflict with the unique slug."""
    plan, _ = SubscriptionPlan.objects.get_or_create(
        slug="premium-monthly",
        defaults={
            "name": "Premium Mensuel",
            "tier": "premium",
            "period": "monthly",
            "price": "59.99",
            "includes_classes": True,
        },
    )
    sub = Subscription.objects.create(user=user, plan=plan, price_paid="59.99")
    sub.activate()
    return sub


class BookingApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat = Category.objects.create(name="Fitness")
        cls.course = Course.objects.create(
            title="Yoga", category=cls.cat, capacity=10, price_unit="12.00"
        )
        cls.room = Room.objects.create(name="A", capacity=20)

    def setUp(self):
        self.user = User.objects.create_user(
            email=f"u{self.id()}@e.com", password="Strong-Pass-123!"
        )
        _make_premium_sub_for(self.user)
        self.session = _future_session(self.course, self.room)

    def test_unauthenticated_cannot_book(self):
        response = self.client.post(
            reverse("bookings-book"),
            {"course_session_id": self.session.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_book_endpoint_creates_booking(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("bookings-book"),
            {"course_session_id": self.session.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "confirmed")
        self.assertEqual(Booking.objects.count(), 1)

    def test_full_session_returns_400(self):
        # fill the session
        small_session = _future_session(self.course, Room.objects.create(name="B"), capacity=1)
        other = User.objects.create_user(
            email="other@e.com", password="Strong-Pass-123!"
        )
        _make_premium_sub_for(other)
        services.book(user=other, course_session_id=small_session.id)

        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("bookings-book"),
            {"course_session_id": small_session.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("full", response.data["detail"].lower())

    def test_list_only_returns_my_bookings(self):
        services.book(user=self.user, course_session_id=self.session.id)
        other = User.objects.create_user(
            email="o@e.com", password="Strong-Pass-123!"
        )
        _make_premium_sub_for(other)
        other_session = _future_session(self.course, Room.objects.create(name="X"))
        services.book(user=other, course_session_id=other_session.id)

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("bookings-list"))
        self.assertEqual(response.data["count"], 1)

    def test_cancel_endpoint(self):
        booking = services.book(user=self.user, course_session_id=self.session.id)
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("bookings-cancel", kwargs={"pk": booking.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "cancelled")

    def test_cannot_cancel_others_booking(self):
        booking = services.book(user=self.user, course_session_id=self.session.id)
        intruder = User.objects.create_user(
            email="i@e.com", password="Strong-Pass-123!"
        )
        self.client.force_authenticate(intruder)
        response = self.client.post(
            reverse("bookings-cancel", kwargs={"pk": booking.id})
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class StatsAndRecommendationsTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat_yoga = Category.objects.create(name="Yoga")
        cls.cat_tennis = Category.objects.create(name="Tennis")
        cls.cat_fitness = Category.objects.create(name="Fitness")
        cls.course_yoga = Course.objects.create(
            title="Yoga Vinyasa",
            category=cls.cat_yoga,
            level=Course.Level.BEGINNER,
            capacity=10,
        )
        cls.course_tennis = Course.objects.create(
            title="Tennis", category=cls.cat_tennis, capacity=4
        )
        cls.course_fitness = Course.objects.create(
            title="Fitness", category=cls.cat_fitness, capacity=10
        )
        cls.room = Room.objects.create(name="A")

    def setUp(self):
        self.user = User.objects.create_user(
            email=f"u{self.id()}@e.com", password="Strong-Pass-123!"
        )
        _make_premium_sub_for(self.user)

    _room_counter = 0

    def _make_past_booking(self, course):
        type(self)._room_counter += 1
        starts = timezone.now() - timedelta(days=3)
        session = CourseSession.objects.create(
            course=course,
            room=Room.objects.create(
                name=f"R-past-{course.id}-{type(self)._room_counter}"
            ),
            starts_at=starts,
            ends_at=starts + timedelta(hours=1),
            capacity=10,
        )
        return Booking.objects.create(
            user=self.user,
            course_session=session,
            channel=Booking.Channel.SUBSCRIPTION,
            status=Booking.Status.CONFIRMED,
        )

    def test_stats_with_no_history(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("me-stats"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_attended"], 0)
        self.assertIsNone(response.data["favorite_category"])
        self.assertIsNone(response.data["next_booking"])

    def test_stats_aggregates_history(self):
        self._make_past_booking(self.course_yoga)
        self._make_past_booking(self.course_yoga)
        self._make_past_booking(self.course_tennis)
        future_session = _future_session(self.course_fitness, self.room)
        services.book(user=self.user, course_session_id=future_session.id)

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("me-stats"))
        self.assertEqual(response.data["total_attended"], 3)
        self.assertEqual(response.data["upcoming_count"], 1)
        self.assertEqual(response.data["favorite_category"], "Yoga")
        self.assertEqual(
            response.data["category_breakdown"][0]["category"], "Yoga"
        )
        self.assertEqual(response.data["next_booking"]["course_id"], self.course_fitness.id)

    def test_recommendations_use_history_categories(self):
        self._make_past_booking(self.course_yoga)
        future = _future_session(self.course_yoga, self.room)
        _future_session(self.course_tennis, Room.objects.create(name="B"))

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("me-recommendations"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [r["course_slug"] for r in response.data["results"]]
        self.assertIn(self.course_yoga.slug, slugs)
        self.assertIn("yoga", response.data["based_on"]["history_categories"])

    def test_recommendations_excludes_already_booked(self):
        future = _future_session(self.course_yoga, self.room)
        services.book(user=self.user, course_session_id=future.id)
        _future_session(self.course_tennis, Room.objects.create(name="B"))

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("me-recommendations"))
        ids = [r["id"] for r in response.data["results"]]
        self.assertNotIn(future.id, ids)

    def test_recommendations_fallback_when_no_history(self):
        _future_session(self.course_yoga, self.room)
        _future_session(self.course_tennis, Room.objects.create(name="B"))

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("me-recommendations"))
        self.assertGreater(len(response.data["results"]), 0)
        self.assertEqual(response.data["based_on"]["history_categories"], [])


class QuestionnaireTests(APITestCase):
    def test_questionnaire_marks_profile_completed(self):
        user = User.objects.create_user(
            email="q@e.com", password="Strong-Pass-123!"
        )
        Category.objects.create(name="Yoga")
        Category.objects.create(name="Tennis")
        self.client.force_authenticate(user)
        response = self.client.patch(
            reverse("auth-questionnaire"),
            {
                "level": "intermediate",
                "goals": "Lose weight, improve flexibility",
                "favorite_categories": ["yoga", "tennis"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["level"], "intermediate")
        self.assertTrue(response.data["questionnaire_completed"])
        self.assertEqual(
            response.data["preferences"]["categories"], ["yoga", "tennis"]
        )


class CoachSpaceTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat = Category.objects.create(name="Fitness")
        cls.coach = User.objects.create_user(
            email="coach@e.com",
            password="Strong-Pass-123!",
            role=User.Role.COACH,
            first_name="Coach",
            last_name="One",
        )
        cls.other_coach = User.objects.create_user(
            email="other@e.com",
            password="Strong-Pass-123!",
            role=User.Role.COACH,
        )
        cls.member = User.objects.create_user(
            email="m@e.com", password="Strong-Pass-123!"
        )
        cls.course = Course.objects.create(
            title="X", category=cls.cat, coach=cls.coach
        )
        cls.other_course = Course.objects.create(
            title="Y", category=cls.cat, coach=cls.other_coach
        )

    def test_member_blocked_from_coach_dashboard(self):
        self.client.force_authenticate(self.member)
        response = self.client.get(reverse("coach-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_coach_dashboard_returns_kpis(self):
        room = Room.objects.create(name="Acoach")
        future = _future_session(self.course, room)
        booker = User.objects.create_user(
            email="b@e.com", password="Strong-Pass-123!"
        )
        _make_premium_sub_for(booker)
        services.book(user=booker, course_session_id=future.id)

        self.client.force_authenticate(self.coach)
        response = self.client.get(reverse("coach-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["courses_count"], 1)
        self.assertEqual(response.data["upcoming_sessions_count"], 1)
        self.assertEqual(response.data["bookings_last_30_days"], 1)
        self.assertIsNotNone(response.data["next_session"])

    def test_coach_bookings_only_returns_own(self):
        own_room = Room.objects.create(name="Aown")
        other_room = Room.objects.create(name="Bother")
        own_session = _future_session(self.course, own_room)
        other_session = _future_session(self.other_course, other_room)

        booker = User.objects.create_user(
            email="bk@e.com", password="Strong-Pass-123!"
        )
        _make_premium_sub_for(booker)
        services.book(user=booker, course_session_id=own_session.id)
        services.book(user=booker, course_session_id=other_session.id)

        self.client.force_authenticate(self.coach)
        response = self.client.get(reverse("coach-bookings"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["course_session_id"], own_session.id)

    def test_coach_bookings_filter_by_session(self):
        room1 = Room.objects.create(name="Acb1")
        room2 = Room.objects.create(name="Bcb2")
        s1 = _future_session(self.course, room1)
        s2 = _future_session(self.course, room2)
        booker = User.objects.create_user(
            email="b2@e.com", password="Strong-Pass-123!"
        )
        _make_premium_sub_for(booker)
        services.book(user=booker, course_session_id=s1.id)
        services.book(user=booker, course_session_id=s2.id)

        self.client.force_authenticate(self.coach)
        response = self.client.get(reverse("coach-bookings"), {"session": s1.id})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["course_session_id"], s1.id)


class SessionsSeatsAnnotationTests(APITestCase):
    """Confirm the Phase 3 placeholder is now wired: seats_taken on the
    public sessions endpoint reflects confirmed bookings."""

    def test_seats_taken_reflects_confirmed_bookings(self):
        cat = Category.objects.create(name="Fitness")
        course = Course.objects.create(
            title="Yoga", category=cat, capacity=10
        )
        room = Room.objects.create(name="A")
        session = _future_session(course, room, capacity=10)
        user = User.objects.create_user(
            email="z@e.com", password="Strong-Pass-123!"
        )
        _make_premium_sub_for(user)
        services.book(user=user, course_session_id=session.id)

        response = self.client.get(reverse("sessions-list"))
        seat_data = next(
            s for s in response.data["results"] if s["id"] == session.id
        )
        self.assertEqual(seat_data["seats_taken"], 1)
        self.assertEqual(seat_data["seats_available"], 9)
