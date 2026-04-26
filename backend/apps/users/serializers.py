from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CoachProfile, MemberProfile

User = get_user_model()


class MemberProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberProfile
        fields = (
            "date_of_birth",
            "level",
            "goals",
            "preferences",
            "questionnaire_completed",
        )


class CoachProfileSerializer(serializers.ModelSerializer):
    specialties_list = serializers.ListField(read_only=True)

    class Meta:
        model = CoachProfile
        fields = (
            "bio",
            "specialties",
            "specialties_list",
            "years_of_experience",
            "photo",
        )


class UserSerializer(serializers.ModelSerializer):
    """User payload returned to authenticated clients."""

    member_profile = MemberProfileSerializer(read_only=True)
    coach_profile = CoachProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "phone",
            "preferred_language",
            "date_joined",
            "member_profile",
            "coach_profile",
        )
        read_only_fields = ("id", "email", "role", "date_joined")


class UserUpdateSerializer(serializers.ModelSerializer):
    """Fields the user is allowed to edit on themselves."""

    class Meta:
        model = User
        fields = ("first_name", "last_name", "phone", "preferred_language")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "preferred_language",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user


class FitZoneTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT login serializer — returns the user payload alongside tokens."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
