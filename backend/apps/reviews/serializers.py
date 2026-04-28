from rest_framework import serializers

from .models import Rating


class RatingSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    coach_name = serializers.SerializerMethodField()

    class Meta:
        model = Rating
        fields = (
            "id",
            "member",
            "member_name",
            "coach",
            "coach_name",
            "course_session",
            "score",
            "comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "member",
            "member_name",
            "coach_name",
            "created_at",
            "updated_at",
        )

    def get_member_name(self, obj: Rating) -> str:
        full = f"{obj.member.first_name} {obj.member.last_name}".strip()
        return full or obj.member.email.split("@")[0]

    def get_coach_name(self, obj: Rating) -> str:
        full = f"{obj.coach.first_name} {obj.coach.last_name}".strip()
        return full or obj.coach.email.split("@")[0]


class RatingWriteSerializer(serializers.ModelSerializer):
    """Payload for create / update — member is taken from request.user."""

    class Meta:
        model = Rating
        fields = ("coach", "course_session", "score", "comment")
        extra_kwargs = {
            "course_session": {"required": False, "allow_null": True},
            "comment": {"required": False, "allow_blank": True},
        }
