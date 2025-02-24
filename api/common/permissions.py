from rest_framework import permissions


class IsTeacher(permissions.BasePermission):
    """
    Autorise l'accès aux views uniquement aux professeurs et admins.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsAdmin(permissions.BasePermission):
    """
    Autorise l'accès aux views uniquement aux admin.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
            and request.user.is_superuser
        )
