from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from schoolmarksapi.models import User
from schoolmarksapi.serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering_fields = ["username", "date_joined"]

    def get_queryset(self):
        assert isinstance(self.request, Request)
        queryset = User.objects.all()
        role = self.request.query_params.get("role", None)
        class_id = self.request.query_params.get("class_id", None)

        if role == "student":
            queryset = queryset.filter(
                is_staff=False, is_superuser=False, is_active=True
            )
        elif role == "teacher":
            queryset = queryset.filter(
                is_staff=True, is_superuser=False, is_active=True
            )

        if class_id:
            queryset = queryset.filter(class_memberships__class_group_id=class_id)

        return queryset.distinct()

    def _set_user_role(self, user: User, role: str):
        """Helper method to set user role based on is_staff and is_superuser"""
        if role == "admin":
            user.is_staff = True
            user.is_superuser = True
        elif role == "teacher":
            user.is_staff = True
            user.is_superuser = False
        elif role == "student":
            user.is_staff = False
            user.is_superuser = False

        user.is_active = True
        user.save()

    def create(self, request, *args, **kwargs):
        if not (request.user.is_staff and request.user.is_superuser):
            return Response(
                {"detail": "Only admin users can create users"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user_id = kwargs.get("pk")
        if (
            not (request.user.is_staff and request.user.is_superuser)
            and str(request.user.id) != user_id
        ):
            return Response(
                {"detail": "Only admin users can update other users"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not (request.user.is_staff and request.user.is_superuser):
            return Response(
                {"detail": "Only admin users can update users"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)
