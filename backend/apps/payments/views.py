import logging

import stripe
from django.conf import settings
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.models import Course
from apps.sessions_app.models import CourseSession
from apps.subscriptions.models import Subscription, SubscriptionPlan

from .models import Payment
from .serializers import (
    CheckoutCourseSerializer,
    CheckoutSubscriptionSerializer,
    PaymentSerializer,
)
from .services import _session_retrieve, create_checkout_session

logger = logging.getLogger(__name__)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """List the current user's payments — read-only."""

    serializer_class = PaymentSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        qs = Payment.objects.select_related(
            "subscription__plan", "course", "user"
        ).order_by("-created_at")
        if self.request.user.role != "admin":
            qs = qs.filter(user=self.request.user)
        return qs


class CheckoutSubscriptionView(APIView):
    """POST /api/payments/checkout/subscription/ — start Checkout for a plan."""

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = CheckoutSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            plan = SubscriptionPlan.objects.get(
                id=serializer.validated_data["plan_id"], is_active=True
            )
        except SubscriptionPlan.DoesNotExist as exc:
            raise ValidationError({"plan_id": "Plan not found or inactive."}) from exc

        Subscription.expire_lapsed()
        if Subscription.current_for(request.user):
            raise ValidationError(
                {"detail": "You already have an active subscription."}
            )

        sub = Subscription.objects.create(
            user=request.user, plan=plan, price_paid=plan.price
        )
        payment = Payment.objects.create(
            user=request.user,
            kind=Payment.Kind.SUBSCRIPTION,
            subscription=sub,
            amount=plan.price,
        )
        try:
            checkout = create_checkout_session(
                payment,
                product_name=f"FitZone — {plan.name}",
                success_path="/checkout/success",
                cancel_path="/checkout/cancel",
            )
        except stripe.error.StripeError as exc:
            payment.mark_failed()
            sub.delete()
            logger.exception("Stripe checkout creation failed")
            raise ValidationError({"detail": str(exc)}) from exc

        return Response(
            {"checkout_url": checkout.url, "session_id": checkout.session_id},
            status=status.HTTP_201_CREATED,
        )


class CheckoutCourseView(APIView):
    """POST /api/payments/checkout/course/ — pay-per-class purchase.

    Phase 6 hooks the booking creation off the same webhook flow."""

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = CheckoutCourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            course = Course.objects.get(
                id=serializer.validated_data["course_id"], is_active=True
            )
        except Course.DoesNotExist as exc:
            raise ValidationError({"course_id": "Course not found or inactive."}) from exc

        course_session = None
        cs_id = serializer.validated_data.get("course_session_id")
        if cs_id:
            try:
                course_session = CourseSession.objects.get(id=cs_id, course=course)
            except CourseSession.DoesNotExist as exc:
                raise ValidationError(
                    {"course_session_id": "Session not found for this course."}
                ) from exc

        if course.price_unit <= 0:
            raise ValidationError(
                {"course_id": "This course is not sold per unit."}
            )

        payment = Payment.objects.create(
            user=request.user,
            kind=Payment.Kind.COURSE,
            course=course,
            course_session=course_session,
            amount=course.price_unit,
        )
        try:
            checkout = create_checkout_session(
                payment,
                product_name=f"FitZone — {course.title}",
                success_path="/checkout/success",
                cancel_path="/checkout/cancel",
            )
        except stripe.error.StripeError as exc:
            payment.mark_failed()
            logger.exception("Stripe checkout creation failed")
            raise ValidationError({"detail": str(exc)}) from exc

        return Response(
            {"checkout_url": checkout.url, "session_id": checkout.session_id},
            status=status.HTTP_201_CREATED,
        )


def _post_success_for(payment: Payment):
    """Hook called once a Payment flips to SUCCEEDED — activates the
    subscription or creates the booking depending on payment kind."""
    if payment.kind == Payment.Kind.SUBSCRIPTION and payment.subscription:
        sub = payment.subscription
        if sub.status == Subscription.Status.PENDING:
            sub.activate(when=timezone.now())
        return

    if payment.kind == Payment.Kind.COURSE:
        from apps.bookings.services import book_for_payment

        book_for_payment(payment)


class CheckoutVerifyView(APIView):
    """GET /api/payments/checkout/verify/?session_id=cs_xxx

    Active fallback when no Stripe webhook listener is running (typical
    in localhost dev without Stripe CLI). Looks up the Payment by
    stripe_session_id, calls Stripe to check the session's payment_status,
    and activates the subscription if paid. Idempotent on repeat calls.
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        session_id = request.query_params.get("session_id", "").strip()
        if not session_id:
            raise ValidationError({"session_id": "Missing query parameter."})

        payment = Payment.objects.filter(
            stripe_session_id=session_id, user=request.user
        ).first()
        if not payment:
            return Response(
                {"detail": "Payment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if payment.status == Payment.Status.SUCCEEDED:
            return Response(
                {"status": payment.status, "already_activated": True}
            )

        try:
            session = _session_retrieve(session_id)
        except stripe.error.StripeError as exc:
            logger.exception("Stripe session retrieve failed")
            raise ValidationError({"detail": str(exc)}) from exc

        payment_status = session.get("payment_status")
        if payment_status == "paid":
            payment.mark_succeeded(
                payment_intent=session.get("payment_intent", "") or "",
            )
            _post_success_for(payment)
            return Response({"status": payment.status})

        if payment_status in ("unpaid", "no_payment_required"):
            return Response({"status": payment.status, "stripe_status": payment_status})

        return Response({"status": payment.status, "stripe_status": payment_status})


class StripeWebhookView(APIView):
    """POST /api/payments/webhook/stripe/ — receives Stripe events.

    Handles checkout.session.completed (success) and payment_intent.payment_failed.
    Idempotent via Payment.stripe_event_id."""

    permission_classes = (AllowAny,)
    authentication_classes: list = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, secret)
        except (ValueError, stripe.error.SignatureVerificationError) as exc:
            logger.warning("Stripe webhook signature failed: %s", exc)
            return Response({"detail": "invalid"}, status=status.HTTP_400_BAD_REQUEST)

        event_id = event.get("id", "")
        event_type = event.get("type", "")

        if event_type == "checkout.session.completed":
            return self._handle_checkout_completed(event["data"]["object"], event_id)

        if event_type == "payment_intent.payment_failed":
            return self._handle_payment_failed(event["data"]["object"], event_id)

        return Response({"received": True})

    @staticmethod
    def _find_payment(session: dict) -> Payment | None:
        meta_id = (session.get("metadata") or {}).get("payment_id")
        if meta_id:
            payment = Payment.objects.filter(id=meta_id).first()
            if payment:
                return payment
        sid = session.get("id")
        if sid:
            return Payment.objects.filter(stripe_session_id=sid).first()
        return None

    def _handle_checkout_completed(self, session: dict, event_id: str):
        payment = self._find_payment(session)
        if not payment:
            logger.warning("Webhook: no Payment matched session %s", session.get("id"))
            return Response({"received": True})

        if (
            payment.status == Payment.Status.SUCCEEDED
            and payment.stripe_event_id == event_id
        ):
            return Response({"received": True, "duplicate": True})

        payment.mark_succeeded(
            payment_intent=session.get("payment_intent", "") or "",
            event_id=event_id,
        )
        _post_success_for(payment)
        return Response({"received": True})

    def _handle_payment_failed(self, intent: dict, event_id: str):
        payment_intent_id = intent.get("id", "")
        payment = Payment.objects.filter(
            stripe_payment_intent=payment_intent_id
        ).first()
        if not payment:
            return Response({"received": True})
        payment.mark_failed(event_id=event_id)
        return Response({"received": True})
