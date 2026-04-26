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
