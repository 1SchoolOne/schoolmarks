from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from common.users import get_user_role
from schoolmarksapi.models import Course
from schoolmarksapi.serializers import (
    CourseSerializer,
    CourseInputSerializer,
)
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from drf_spectacular.types import OpenApiTypes


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["code", "professor"]
    search_fields = ["name", "code"]

    def get_serializer_class(self):
        if (
            self.action == "create"
            or self.action == "update"
            or self.action == "partial_update"
        ):
            return CourseInputSerializer

        return super().get_serializer_class()

    def get_queryset(self):
        queryset = self._get_role_based_queryset()

        name = self.request.query_params.get("name", None)
        code = self.request.query_params.get("code", None)
        class_id = self.request.query_params.get("class_id", None)

        if name:
            queryset = queryset.filter(name=name)

        if code:
            queryset = queryset.filter(code=code)

        if class_id:
            queryset = queryset.filter(classes__class_group_id=class_id)

        return queryset.distinct()

    @extend_schema(request=CourseInputSerializer, responses=CourseSerializer)
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(request=CourseInputSerializer, responses=CourseSerializer)
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(request=CourseInputSerializer, responses=CourseSerializer)
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        parameters=[
            OpenApiParameter("name", OpenApiTypes.STR, OpenApiParameter.QUERY),
            OpenApiParameter("code", OpenApiTypes.STR, OpenApiParameter.QUERY),
            OpenApiParameter("class_id", OpenApiTypes.UUID, OpenApiParameter.QUERY),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        request=inline_serializer(
            name="BulkDeleteCourseSerializer",
            fields={
                "course_ids": serializers.ListField(
                    child=serializers.UUIDField(), required=True
                ),
            },
        ),
        responses=inline_serializer(
            name="BulkDeleteCourseResponseSerializer",
            fields={
                "detail": serializers.CharField(),
                "count": serializers.IntegerField(
                    help_text="Number of classes deleted"
                ),
            },
        ),
    )
    @action(detail=False, methods=["post"])
    def bulk_delete(self, request):
        course_ids = request.data.get("course_ids", [])
        if not course_ids:
            return Response(
                {"detail": "No ids provided for deletion"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # First count how many courses match the IDs
        courses_to_delete = Course.objects.filter(id__in=course_ids)
        count = courses_to_delete.count()

        # Then delete them
        courses_to_delete.delete()

        return Response(
            {
                "detail": f"Successfully deleted {count} courses",
                "count": count,
            },
            status=status.HTTP_200_OK,
        )

    def _get_role_based_queryset(self):
        user_role = get_user_role(self.request.user)

        if user_role == "admin":
            # Retourne toutes les sessions de cours
            return Course.objects.all()

        if user_role == "teacher":
            # Retourne uniquement les sessions de cours que le prof donne
            return Course.objects.filter(professor=self.request.user)

        if user_role == "student":
            # Trouve les cours auxquels l'étudiant est inscrit
            return Course.objects.filter(
                classes__class_group__student_memberships__student=self.request.user
            )
