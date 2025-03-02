from rest_framework import viewsets

from common.users import get_user_role
from schoolmarksapi.models import (
    Attendance,
)
from schoolmarksapi.serializers import (
    AttendanceSerializer,
)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    http_method_names = ["get"]

    def get_queryset(self):
        queryset = self._get_role_based_queryset()
        class_session_id = self.request.query_params.get("class_session_id")
        if class_session_id is not None:
            queryset = queryset.filter(class_session_id=class_session_id)

            if not queryset.exists():
                return Attendance.objects.none()

        return queryset

    def _get_role_based_queryset(self):
        user_role = get_user_role(self.request.user)

        if user_role == "admin":
            # Retourne toutes les sessions de cours
            return Attendance.objects.all()

        if user_role == "teacher":
            # Retourne uniquement les sessions de cours que le prof donne
            return Attendance.objects.all()

        if user_role == "student":
            return Attendance.objects.filter(student_id=self.request.user)
