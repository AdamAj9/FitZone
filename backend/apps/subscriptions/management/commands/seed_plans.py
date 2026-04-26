from django.core.management.base import BaseCommand

from apps.subscriptions.models import SubscriptionPlan

PLANS = [
    {
        "slug": "basic-monthly",
        "name": "Basic Mensuel",
        "tier": "basic",
        "period": "monthly",
        "price": "29.99",
        "includes_classes": False,
        "description": "Accès illimité à la salle de musculation et aux équipements.",
        "features": [
            "Accès à la salle de musculation",
            "Vestiaires et douches",
            "Espace cardio",
            "Sans engagement (mensuel)",
        ],
    },
    {
        "slug": "basic-yearly",
        "name": "Basic Annuel",
        "tier": "basic",
        "period": "yearly",
        "price": "299.00",
        "includes_classes": False,
        "description": "Accès illimité à la salle, formule annuelle (2 mois offerts).",
        "features": [
            "Accès à la salle de musculation",
            "Vestiaires et douches",
            "Espace cardio",
            "Économie de 60 € sur l'année",
        ],
    },
    {
        "slug": "premium-monthly",
        "name": "Premium Mensuel",
        "tier": "premium",
        "period": "monthly",
        "price": "59.99",
        "includes_classes": True,
        "description": "Tout l'accès Basic plus l'ensemble des cours collectifs en illimité.",
        "features": [
            "Tout l'accès Basic",
            "Cours collectifs illimités",
            "Piscine, tennis, yoga, fitness",
            "Réservation prioritaire",
        ],
    },
    {
        "slug": "premium-yearly",
        "name": "Premium Annuel",
        "tier": "premium",
        "period": "yearly",
        "price": "599.00",
        "includes_classes": True,
        "description": "Tout l'accès Premium en formule annuelle (2 mois offerts).",
        "features": [
            "Tout l'accès Premium",
            "Cours collectifs illimités",
            "Piscine, tennis, yoga, fitness",
            "Économie de 120 € sur l'année",
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the 4 commercial subscription plans (Basic/Premium × Monthly/Yearly)."

    def handle(self, *args, **opts):
        for data in PLANS:
            plan, created = SubscriptionPlan.objects.update_or_create(
                slug=data["slug"], defaults=data
            )
            verb = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"{verb}: {plan.name}"))
        self.stdout.write(
            self.style.SUCCESS(f"Total active plans: {SubscriptionPlan.objects.count()}")
        )
