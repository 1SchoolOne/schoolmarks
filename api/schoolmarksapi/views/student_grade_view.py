from rest_framework import viewsets
from common.users import get_user_role
from schoolmarksapi.models import StudentGrade
from schoolmarksapi.serializers import (
    StudentGradeSerializer,
)


class StudentGradeViewSet(viewsets.ModelViewSet):
    queryset = StudentGrade.objects.all()
    serializer_class = StudentGradeSerializer
    filterset_fields = ["grade", "student"]
    search_fields = ["grade__name", "student__email"]
    ordering_fields = ["created_at", "value"]
    http_method_names = ["get"]

    def get_queryset(self):
        return self._get_role_based_queryset()

    def _get_role_based_queryset(self):
        user_role = get_user_role(self.request.user)

        if user_role == "admin":
            return StudentGrade.objects.all()

        if user_role == "teacher":
            return StudentGrade.objects.filter(
                assessment__course__professor=self.request.user
            )

        if user_role == "student":
            return StudentGrade.objects.filter(student=self.request.user)
