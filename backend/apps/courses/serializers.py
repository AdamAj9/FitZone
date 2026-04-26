from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.users.serializers import CoachProfileSerializer

from .models import Category, Course

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "icon",
            "is_active",
            "course_count",
        )
        read_only_fields = ("id", "slug", "course_count")


class CoachPublicSerializer(serializers.ModelSerializer):
    """Public coach payload — embedded inside courses and listed on /coaches/."""

    coach_profile = CoachProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "full_name", "coach_profile")

    def get_full_name(self, obj: User) -> str:
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name or obj.email.split("@")[0]


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight payload for catalogue cards."""

    category = serializers.SlugRelatedField(read_only=True, slug_field="name")
    category_slug = serializers.SlugRelatedField(
        read_only=True, slug_field="slug", source="category"
    )
    coach_name = serializers.SerializerMethodField()
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "slug",
            "category",
            "category_slug",
            "coach_name",
            "level",
            "duration_minutes",
            "capacity",
            "price_unit",
            "image",
            "is_active",
        )

    def get_coach_name(self, obj: Course) -> str | None:
        if not obj.coach:
            return None
        full = f"{obj.coach.first_name} {obj.coach.last_name}".strip()
        return full or obj.coach.email.split("@")[0]


class CourseDetailSerializer(serializers.ModelSerializer):
    """Full payload for the course detail page."""

    category = CategorySerializer(read_only=True)
    coach = CoachPublicSerializer(read_only=True)

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "category",
            "coach",
            "level",
            "duration_minutes",
            "capacity",
            "price_unit",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        )


class CourseWriteSerializer(serializers.ModelSerializer):
    """Coach/admin payload for create/update."""

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "description",
            "category",
            "coach",
            "level",
            "duration_minutes",
            "capacity",
            "price_unit",
            "image",
            "is_active",
        )
        read_only_fields = ("id",)
