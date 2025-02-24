from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from schoolmarksapi.models import Course, CourseEnrollment
from common.permissions import IsTeacher
from schoolmarksapi.serializers import CourseSerializer, CourseEnrollmentSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["code", "professor"]
    search_fields = ["name", "code"]

    def get_queryset(self):
        assert isinstance(self.request, Request)
        queryset = Course.objects.all()
        class_id = self.request.query_params.get("class_id", None)

        if class_id:
            queryset = queryset.filter(enrollments__class_group_id=class_id)

        return queryset.distinct()

    @action(detail=False, methods=["post"])
    def bulk_delete(self, request):
        ids = request.data.get("ids", [])
        if not ids:
            return Response(
                {"detail": "No ids provided for deletion"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # First count how many courses match the IDs
        courses_to_delete = Course.objects.filter(id__in=ids)
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


class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    queryset = CourseEnrollment.objects.all()
    serializer_class = CourseEnrollmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        course_id = self.request.query_params.get("course")
        class_group_id = self.request.query_params.get("class_group")

        if course_id:
            queryset = queryset.filter(course_id=course_id)

        if class_group_id:
            queryset = queryset.filter(class_group_id=class_group_id)

        return queryset

    @action(detail=False, methods=["post"])
    def bulk_delete(self, request):
        ids = request.data.get("ids", [])
        if not ids:
            return Response(
                {"detail": "No ids provided for deletion"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # First count how many enrollments match the IDs
        enrollments_to_delete = CourseEnrollment.objects.filter(id__in=ids)
        count = enrollments_to_delete.count()

        # Then delete them
        enrollments_to_delete.delete()

        return Response(
            {
                "detail": f"Successfully deleted {count} enrollments",
                "count": count,
            },
            status=status.HTTP_200_OK,
        )
