from rest_framework import serializers

from .models import CourseSession, Room


class RoomSerializer(serializers.ModelSerializer):
    building_display = serializers.CharField(
        source="get_building_display", read_only=True
    )

    class Meta:
        model = Room
        fields = (
            "id",
            "name",
            "building",
            "building_display",
            "capacity",
            "is_active",
            "notes",
        )


class SessionListSerializer(serializers.ModelSerializer):
    """Lightweight payload for the planning grid."""

    course_id = serializers.IntegerField(source="course.id", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_slug = serializers.SlugField(source="course.slug", read_only=True)
    category = serializers.CharField(source="course.category.name", read_only=True)
    category_slug = serializers.SlugField(
        source="course.category.slug", read_only=True
    )
    coach_name = serializers.SerializerMethodField()
    coach_id = serializers.IntegerField(source="coach.id", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)
    room_id = serializers.IntegerField(source="room.id", read_only=True)
    seats_taken = serializers.IntegerField(read_only=True)
    seats_available = serializers.IntegerField(read_only=True)

    class Meta:
        model = CourseSession
        fields = (
            "id",
            "course_id",
            "course_title",
            "course_slug",
            "category",
            "category_slug",
            "coach_id",
            "coach_name",
            "room_id",
            "room_name",
            "starts_at",
            "ends_at",
            "capacity",
            "seats_taken",
            "seats_available",
            "status",
        )

    def get_coach_name(self, obj: CourseSession) -> str | None:
        if not obj.coach:
            return None
        full = f"{obj.coach.first_name} {obj.coach.last_name}".strip()
        return full or obj.coach.email.split("@")[0]


class SessionDetailSerializer(SessionListSerializer):
    notes = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta(SessionListSerializer.Meta):
        fields = SessionListSerializer.Meta.fields + (
            "notes",
            "created_at",
            "updated_at",
        )


class SessionWriteSerializer(serializers.ModelSerializer):
    """Coach/admin payload for create/update."""

    class Meta:
        model = CourseSession
        fields = (
            "id",
            "course",
            "coach",
            "room",
            "starts_at",
            "ends_at",
            "capacity",
            "status",
            "notes",
        )
        read_only_fields = ("id",)
        extra_kwargs = {
            "capacity": {"required": False},
            "coach": {"required": False, "allow_null": True},
        }

    def validate(self, attrs):
        instance = CourseSession(**{**(self.instance.__dict__ if self.instance else {}), **attrs})
        instance.pk = self.instance.pk if self.instance else None
        instance.clean()
        return attrs
