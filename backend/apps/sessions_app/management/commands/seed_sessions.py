from datetime import datetime, time, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.courses.models import Course
from apps.sessions_app.models import CourseSession, Room

ROOMS = [
    ("Salle Aurore", "main", 25),
    ("Salle Olympe", "main", 30),
    ("Salle Pilates", "main", 12),
    ("Piscine principale", "annex", 30),
    ("Court de tennis 1", "annex", 6),
    ("Court de tennis 2", "annex", 6),
    ("Studio Cycling", "annex", 22),
]

ROOM_BY_CATEGORY = {
    "Yoga": "Salle Pilates",
    "Fitness": "Salle Aurore",
    "Musculation": "Salle Olympe",
    "Piscine": "Piscine principale",
    "Tennis": "Court de tennis 1",
    "Cycling": "Studio Cycling",
}

WEEKDAY_SLOTS = [time(9, 0), time(12, 30), time(18, 0), time(19, 30)]
WEEKEND_SLOTS = [time(10, 0), time(11, 30)]


class Command(BaseCommand):
    help = "Seed rooms and a 14-day rolling planning of CourseSession entries."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days", type=int, default=14, help="Days of planning to generate."
        )
        parser.add_argument(
            "--reset", action="store_true", help="Delete existing sessions first."
        )

    def handle(self, *args, **opts):
        for name, building, capacity in ROOMS:
            Room.objects.get_or_create(
                name=name,
                defaults={"building": building, "capacity": capacity},
            )
        self.stdout.write(self.style.SUCCESS(f"Rooms: {Room.objects.count()}"))

        if opts["reset"]:
            CourseSession.objects.all().delete()
            self.stdout.write(self.style.WARNING("Existing sessions deleted."))

        today = timezone.localdate()
        tz = timezone.get_current_timezone()
        created = 0

        for course in Course.objects.filter(is_active=True).select_related("category"):
            room_name = ROOM_BY_CATEGORY.get(course.category.name, "Salle Aurore")
            room = Room.objects.get(name=room_name)

            for day_offset in range(opts["days"]):
                day = today + timedelta(days=day_offset)
                slots = WEEKEND_SLOTS if day.weekday() >= 5 else WEEKDAY_SLOTS

                slot = slots[(day_offset + course.id) % len(slots)]

                if (course.id + day_offset) % 3 != 0:
                    continue

                starts_at = timezone.make_aware(datetime.combine(day, slot), tz)
                ends_at = starts_at + timedelta(minutes=course.duration_minutes)

                if CourseSession.objects.filter(
                    room=room,
                    starts_at__lt=ends_at,
                    ends_at__gt=starts_at,
                ).exists():
                    continue

                CourseSession.objects.create(
                    course=course,
                    coach=course.coach,
                    room=room,
                    starts_at=starts_at,
                    ends_at=ends_at,
                    capacity=course.capacity,
                )
                created += 1

        self.stdout.write(self.style.SUCCESS(f"Sessions created: {created}"))
        self.stdout.write(
            self.style.SUCCESS(f"Total sessions: {CourseSession.objects.count()}")
        )
