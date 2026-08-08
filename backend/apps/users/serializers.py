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


class QuestionnaireSerializer(serializers.ModelSerializer):
    """Onboarding questionnaire — sets level, goals, preferred categories.

    Marks the profile as completed. `preferences.categories` is a list of
    category slugs the member is interested in; the recommender uses it
    as a fallback when the user has no booking history yet."""

    favorite_categories = serializers.ListField(
        child=serializers.SlugField(),
        required=False,
        allow_empty=True,
        write_only=True,
    )

    class Meta:
        model = MemberProfile
        fields = (
            "level",
            "goals",
            "favorite_categories",
            "questionnaire_completed",
        )
        read_only_fields = ("questionnaire_completed",)

    def update(self, instance: MemberProfile, validated_data):
        favorites = validated_data.pop("favorite_categories", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if favorites is not None:
            preferences = dict(instance.preferences or {})
            preferences["categories"] = favorites
            instance.preferences = preferences
        instance.questionnaire_completed = True
        instance.save()
        return instance


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
        field = self.username_field
        if attrs.get(field):
            attrs[field] = attrs[field].strip().lower()
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data