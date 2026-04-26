from rest_framework.permissions import BasePermission

from .models import User


class IsMember(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.MEMBER
        )


class IsCoach(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.COACH
        )


class IsAdminRole(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == User.Role.ADMIN or request.user.is_superuser)
        )


class IsCoachOrAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role in (User.Role.COACH, User.Role.ADMIN)
                or request.user.is_superuser
            )
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level: allow if request.user owns the object or is admin."""

    def has_object_permission(self, request, view, obj) -> bool:
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser or request.user.role == User.Role.ADMIN:
            return True
        owner = getattr(obj, "user", obj)
        return owner == request.user
