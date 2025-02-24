from rest_framework import status, viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from django.utils import timezone

from common.users import get_user_role
from common.utils import TOTP
from schoolmarksapi.models import (
    AttendanceDetail,
    AttendanceRecord,
    CheckinSession,
    ClassSession,
)
from schoolmarksapi.models.class_student import ClassStudent
from schoolmarksapi.models.course_enrollment import CourseEnrollment
from schoolmarksapi.serializers import (
    AttendanceDetailSerializer,
    AttendanceRecordSerializer,
)


class AttendanceDetailViewSet(viewsets.ModelViewSet):
    queryset = AttendanceDetail.objects.all()
    serializer_class = AttendanceDetailSerializer


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer

    def list(self, request, *args, **kwargs):
        checkin_session_id = request.query_params.get("checkin_session_id")
        if checkin_session_id:
            instances = AttendanceRecord.objects.filter(
                checkin_session_id=checkin_session_id
            )
            serializer = self.get_serializer(instances, many=True)
            return Response(serializer.data)

        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = self._get_role_based_queryset()
        checkin_session_id = self.request.query_params.get("checkin_session_id")
        if checkin_session_id is not None:
            queryset = queryset.filter(checkin_session_id=checkin_session_id)

            if not queryset.exists():
                return AttendanceRecord.objects.none()

        return queryset

    def create(self, request, *args, **kwargs):
        # Verify TOTP code presence in the request
        totp_code = request.data.get("totp_code")
        if not totp_code:
            return Response(
                {"status": "error", "message": "totp_code is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify check-in session ID presence in the request
        checkin_session_id = request.data.get("checkin_session_id")
        if not checkin_session_id:
            return Response(
                {"status": "error", "message": "checkin_session_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            checkin_session = get_object_or_404(CheckinSession, id=checkin_session_id)
        except:
            return Response(
                {
                    "status": "error",
                    "message": "Class session not found",
                    "class_session_id": checkin_session_id,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Validate TOTP code
        totp = TOTP()
        if not totp.verify_token(checkin_session.secret, totp_code):
            return Response(
                {"status": "error", "message": "Invalid or expired TOTP code"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify if user is a student
        user_role = get_user_role(self.request.user)

        if user_role != "student":
            return Response(
                {
                    "status": "error",
                    "message": "You cannot register to a check-in session as an admin nor teacher.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if student is already registered for this check-in session
        existing_record = AttendanceRecord.objects.filter(
            checkin_session=checkin_session, student=self.request.user
        ).exists()

        if existing_record:
            return Response(
                {
                    "status": "error",
                    "message": "You have already registered for this check-in session.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        class_session = checkin_session.class_session
        is_enrolled = CourseEnrollment.objects.filter(
            course=class_session.course,
            class_group_id__in=ClassStudent.objects.filter(
                student=self.request.user
            ).values_list("class_group_id", flat=True),
        ).exists()

        if not is_enrolled:
            return Response(
                {
                    "status": "error",
                    "message": "You are not enrolled in this course.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        checked_in_at = timezone.now()
        late_at = checkin_session.started_at
        is_session_closed = (
            checkin_session.status == "closed"
            or checked_in_at > checkin_session.closed_at
        )

        data = {
            "checkin_session": str(checkin_session.id),
            "student": self.request.user.id,
            "checked_in_at": checked_in_at,
        }

        if is_session_closed:
            return Response(
                {
                    "status": "error",
                    "message": "This check-in session is closed.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        elif checked_in_at > late_at:
            data["status"] = "late"
        else:
            data["status"] = "present"

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def _get_role_based_queryset(self):
        user_role = get_user_role(self.request.user)

        if user_role == "admin":
            # Retourne toutes les sessions de cours
            return AttendanceRecord.objects.all()

        if user_role == "teacher":
            # Retourne uniquement les sessions de cours que le prof donne
            return AttendanceRecord.objects.all()

        if user_role == "student":
            return AttendanceRecord.objects.filter(student_id=self.request.user)
