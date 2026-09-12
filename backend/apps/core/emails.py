"""Transactional emails (registration, payment confirmation).

Rendering and sending are best-effort: a failed send is logged but never
raises, so a broken SMTP config can't take down registration or checkout.
"""

from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

REGISTRATION_STRINGS = {
    "fr": {
        "subject": "Bienvenue chez FitZone !",
        "preheader": "Votre compte est prêt — direction la salle.",
        "greeting": "Bienvenue{name} !",
        "intro": "Votre compte FitZone est activé. Vous pouvez dès maintenant réserver vos cours, suivre votre progression et gérer votre abonnement, le tout en ligne.",
        "list_title": "Pour bien démarrer :",
        "list_items": [
            "Parcourez le planning et réservez votre première séance",
            "Choisissez la formule qui vous correspond",
            "Faites connaissance avec nos coachs",
        ],
        "cta_label": "Découvrir mes cours",
        "cta_path": "/courses",
        "footer_note": "Vous recevez cet e-mail car un compte a été créé avec cette adresse sur FitZone.",
    },
    "en": {
        "subject": "Welcome to FitZone!",
        "preheader": "Your account is ready — let's get moving.",
        "greeting": "Welcome{name}!",
        "intro": "Your FitZone account is active. You can now book classes, track your progress and manage your subscription, all online.",
        "list_title": "To get started:",
        "list_items": [
            "Browse the schedule and book your first session",
            "Choose the plan that fits you",
            "Meet our coaches",
        ],
        "cta_label": "Explore classes",
        "cta_path": "/courses",
        "footer_note": "You're receiving this email because an account was created with this address on FitZone.",
    },
}

PAYMENT_STRINGS = {
    "fr": {
        "subject": "Paiement confirmé — FitZone",
        "preheader": "Voici votre confirmation de paiement.",
        "greeting": "Merci{name} !",
        "intro": "Votre paiement a bien été reçu. Voici le récapitulatif :",
        "label_item": "Article",
        "label_amount": "Montant",
        "label_date": "Date",
        "cta_label_subscription": "Voir mon abonnement",
        "cta_path_subscription": "/my-subscription",
        "cta_label_course": "Voir mes réservations",
        "cta_path_course": "/my-bookings",
        "generic_item": "Réservation FitZone",
        "footer_note": "Ceci est une confirmation automatique de paiement FitZone.",
    },
    "en": {
        "subject": "Payment confirmed — FitZone",
        "preheader": "Here's your payment confirmation.",
        "greeting": "Thank you{name}!",
        "intro": "Your payment has been received. Here's the summary:",
        "label_item": "Item",
        "label_amount": "Amount",
        "label_date": "Date",
        "cta_label_subscription": "View my subscription",
        "cta_path_subscription": "/my-subscription",
        "cta_label_course": "View my bookings",
        "cta_path_course": "/my-bookings",
        "generic_item": "FitZone booking",
        "footer_note": "This is an automatic FitZone payment confirmation.",
    },
}


def _lang_for(user) -> str:
    return user.preferred_language if user.preferred_language in ("fr", "en") else "fr"


def send_branded_email(*, to: str, subject: str, template_name: str, context: dict) -> bool:
    """Render templates/emails/<template_name>.html and send it, with an
    auto-generated plain-text fallback."""
    full_context = {"frontend_url": settings.FRONTEND_URL, **context}
    try:
        html_body = render_to_string(f"emails/{template_name}.html", full_context)
        text_body = strip_tags(html_body)
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to],
        )
        message.attach_alternative(html_body, "text/html")
        message.send(fail_silently=False)
        return True
    except Exception:
        logger.exception("Failed to send %r email to %s", template_name, to)
        return False


def send_registration_email(user) -> bool:
    strings = REGISTRATION_STRINGS[_lang_for(user)]
    name = f" {user.first_name}" if user.first_name else ""
    return send_branded_email(
        to=user.email,
        subject=strings["subject"],
        template_name="registration_confirmation",
        context={**strings, "greeting": strings["greeting"].format(name=name)},
    )


def send_payment_confirmation_email(payment) -> bool:
    user = payment.user
    strings = PAYMENT_STRINGS[_lang_for(user)]
    name = f" {user.first_name}" if user.first_name else ""

    if payment.kind == "subscription" and payment.subscription:
        item_name = payment.subscription.plan.name
        cta_label = strings["cta_label_subscription"]
        cta_path = strings["cta_path_subscription"]
    else:
        item_name = payment.course.title if payment.course else strings["generic_item"]
        cta_label = strings["cta_label_course"]
        cta_path = strings["cta_path_course"]

    return send_branded_email(
        to=user.email,
        subject=strings["subject"],
        template_name="payment_confirmation",
        context={
            **strings,
            "greeting": strings["greeting"].format(name=name),
            "item_name": item_name,
            "amount": f"{payment.amount:.2f}",
            "currency": payment.currency,
            "date": timezone.localtime(payment.updated_at).strftime("%d/%m/%Y"),
            "cta_label": cta_label,
            "cta_path": cta_path,
        },
    )


def send_contact_notification(contact) -> bool:
    """Tell the gym a contact form was submitted.

    Sent to CONTACT_NOTIFY_EMAIL (falling back to DEFAULT_FROM_EMAIL), with
    the visitor's address as reply-to so staff can answer straight from
    their client. Best-effort like every other send here: the row is
    already saved, so a failure loses the notification, never the enquiry.
    """
    to = getattr(settings, "CONTACT_NOTIFY_EMAIL", "") or settings.DEFAULT_FROM_EMAIL
    received = timezone.localtime(contact.created_at)
    body = "\n".join([
        f"De : {contact.first_name} {contact.last_name} <{contact.email}>",
        f"Sujet : {contact.get_subject_display()}",
        f"Recu le : {received:%d/%m/%Y %H:%M}",
        "",
        contact.message,
        "",
    ])
    try:
        message = EmailMultiAlternatives(
            subject=f"[FitZone] Nouveau message - {contact.get_subject_display()}",
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to],
            reply_to=[contact.email],
        )
        message.send(fail_silently=False)
        return True
    except Exception:
        logger.exception("Failed to send contact notification for #%s", contact.pk)
        return False
