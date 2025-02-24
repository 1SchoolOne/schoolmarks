from django.contrib.auth.models import AbstractUser, AnonymousUser
from allauth.headless.adapter import DefaultHeadlessAdapter
from typing import Any, Dict
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"


def get_user_display_name(user):
    if user.first_name and user.last_name:
        return f"{user.first_name} {user.last_name}"
    return user.username


def get_user_role(user: AbstractUser | AnonymousUser) -> UserRole:
    if user.is_staff and user.is_superuser:
        return UserRole.ADMIN
    elif user.is_staff:
        return UserRole.TEACHER
    else:
        return UserRole.STUDENT


# Adapteur custom pour django-allauth. Permet d'ajouter le role utilisateur aux
# données de base.
class CustomHeadlessAdapter(DefaultHeadlessAdapter):
    def serialize_user(self, user) -> Dict[str, Any]:
        serialized_user = super().serialize_user(user)
        serialized_user["role"] = get_user_role(user)
        serialized_user["has_changed_password"] = user.has_changed_password

        return serialized_user
