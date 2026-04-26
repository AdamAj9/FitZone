from rest_framework import serializers

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    channel_display = serializers.CharField(source="get_channel_display", read_only=True)

    course_session_id = serializers.IntegerField(source="course_session.id", read_only=True)
    course_id = serializers.IntegerField(
        source="course_session.course.id", read_only=True
    )
    course_title = serializers.CharField(
        source="course_session.course.title", read_only=True
    )
    course_slug = serializers.SlugField(
        source="course_session.course.slug", read_only=True
    )
    starts_at = serializers.DateTimeField(
        source="course_session.starts_at", read_only=True
    )
    ends_at = serializers.DateTimeField(
        source="course_session.ends_at", read_only=True
    )
    room_name = serializers.CharField(
        source="course_session.room.name", read_only=True
    )

    class Meta:
        model = Booking
        fields = (
            "id",
            "status",
            "status_display",
            "channel",
            "channel_display",
            "course_session_id",
            "course_id",
            "course_title",
            "course_slug",
            "starts_at",
            "ends_at",
            "room_name",
            "payment",
            "cancelled_at",
            "created_at",
        )
        read_only_fields = fields


class BookSerializer(serializers.Serializer):
    course_session_id = serializers.IntegerField()
