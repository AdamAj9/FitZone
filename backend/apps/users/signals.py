from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import CoachProfile, MemberProfile, User


@receiver(post_save, sender=User)
def create_role_profile(sender, instance: User, created: bool, **kwargs):
    """Auto-create the matching profile when a user is created or their role changes."""
    if instance.role == User.Role.MEMBER:
        MemberProfile.objects.get_or_create(user=instance)
    elif instance.role == User.Role.COACH:
        CoachProfile.objects.get_or_create(user=instance)
