from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.courses.models import Category, Course

User = get_user_model()

CATEGORIES = [
    ("Fitness", "Cours collectifs cardio et renforcement musculaire."),
    ("Musculation", "Programmes guidés en salle de musculation."),
    ("Piscine", "Aquagym, natation libre et cours encadrés."),
    ("Tennis", "Initiation et perfectionnement sur courts intérieurs."),
    ("Yoga", "Vinyasa, Hatha et yoga doux."),
    ("Cycling", "Cours de vélo en intérieur sur musique rythmée."),
]

COACHES = [
    {
        "email": "sophie.martin@fitzone.local",
        "first_name": "Sophie",
        "last_name": "Martin",
        "specialties": "Yoga, Pilates",
        "bio": "10 ans d'expérience en yoga vinyasa et pilates.",
        "years_of_experience": 10,
    },
    {
        "email": "thomas.lefevre@fitzone.local",
        "first_name": "Thomas",
        "last_name": "Lefèvre",
        "specialties": "Musculation, HIIT",
        "bio": "Préparateur physique et coach personnel.",
        "years_of_experience": 7,
    },
    {
        "email": "leo.durand@fitzone.local",
        "first_name": "Léo",
        "last_name": "Durand",
        "specialties": "Tennis, Cardio",
        "bio": "Ancien joueur classé, encadrement tous niveaux.",
        "years_of_experience": 12,
    },
]

COURSES = [
    ("Yoga Vinyasa", "Yoga", "sophie.martin@fitzone.local", "all", 60, 18, "12.00"),
    ("Pilates Reformer", "Yoga", "sophie.martin@fitzone.local", "intermediate", 50, 10, "18.00"),
    ("Cross Training", "Fitness", "thomas.lefevre@fitzone.local", "advanced", 60, 16, "15.00"),
    ("Initiation Musculation", "Musculation", "thomas.lefevre@fitzone.local", "beginner", 60, 12, "10.00"),
    ("HIIT Express", "Fitness", "thomas.lefevre@fitzone.local", "intermediate", 30, 20, "8.00"),
    ("Tennis Découverte", "Tennis", "leo.durand@fitzone.local", "beginner", 60, 6, "20.00"),
    ("Tennis Performance", "Tennis", "leo.durand@fitzone.local", "advanced", 90, 4, "30.00"),
    ("Aquagym", "Piscine", None, "all", 45, 25, "9.00"),
    ("Natation libre encadrée", "Piscine", None, "all", 45, 30, "0.00"),
    ("Cycling Power", "Cycling", "thomas.lefevre@fitzone.local", "intermediate", 45, 22, "12.00"),
]


class Command(BaseCommand):
    help = "Seed the database with default categories, coaches and courses."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing courses and categories before seeding.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            Course.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING("Existing courses/categories deleted."))

        for name, description in CATEGORIES:
            Category.objects.get_or_create(
                name=name, defaults={"description": description}
            )
        self.stdout.write(self.style.SUCCESS(f"Categories: {Category.objects.count()}"))

        for c in COACHES:
            user, created = User.objects.get_or_create(
                email=c["email"],
                defaults={
                    "username": c["email"],
                    "first_name": c["first_name"],
                    "last_name": c["last_name"],
                    "role": User.Role.COACH,
                },
            )
            if created:
                user.set_password("Coach-Pass-123!")
                user.save()
            profile = user.coach_profile
            profile.bio = c["bio"]
            profile.specialties = c["specialties"]
            profile.years_of_experience = c["years_of_experience"]
            profile.save()
        self.stdout.write(self.style.SUCCESS(f"Coaches: {User.objects.filter(role=User.Role.COACH).count()}"))

        for title, cat_name, coach_email, level, duration, capacity, price in COURSES:
            category = Category.objects.get(name=cat_name)
            coach = (
                User.objects.filter(email=coach_email).first() if coach_email else None
            )
            Course.objects.get_or_create(
                title=title,
                defaults={
                    "category": category,
                    "coach": coach,
                    "level": level,
                    "duration_minutes": duration,
                    "capacity": capacity,
                    "price_unit": price,
                    "description": f"{title} — {category.name}.",
                },
            )
        self.stdout.write(self.style.SUCCESS(f"Courses: {Course.objects.count()}"))

        self.stdout.write(self.style.SUCCESS("Seed complete."))
