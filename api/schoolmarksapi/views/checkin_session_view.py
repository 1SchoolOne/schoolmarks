from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework.response import Response
from schoolmarksapi.models import (
    CheckinSession,
    Attendance,
    CourseClassEnrollment,
    ClassSession,
    ClassStudent,
)
from schoolmarksapi.serializers import (
    AttendanceSerializer,
    CheckinSessionSerializer,
    CheckinSessionInputSerializer,
)
from common.users import get_user_role
from common.utils import TOTP
from drf_spectacular.utils import extend_schema, inline_serializer
from schoolmarksapi.tasks.checkin_sessions import close_checkin_session


class CheckinSessionViewSet(viewsets.ModelViewSet):
    queryset = CheckinSession.objects.all()
    serializer_class = CheckinSessionSerializer

    @action(detail=True, methods=["get"])
    def totp(self, request, pk=None):
        session = self.get_object()

        if not session.secret:
            totp = TOTP()
            session.secret = totp.generate_secret()
            session.save()

        current_token = TOTP().generate_token(session.secret)
        return Response({"totp": current_token})

    @extend_schema(
        request=inline_serializer(
            name="CheckinSessionRegisterSerializer",
            fields={
                "totp_code": serializers.CharField(min_length=6, max_length=6),
            },
        )
    )
    @action(detail=True, methods=["post"], url_path="register")
    def register(self, request, pk=None):
        checkin_session = self.get_object()
        totp_code = request.data.get("totp_code")

        # Verify TOTP code presence in the request
        if not totp_code:
            return Response(
                {"status": "error", "message": "totp_code is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        totp = TOTP()
        if not totp.verify_token(checkin_session.secret, totp_code):
            return Response(
                {"status": "error", "message": "Invalid or expired TOTP code"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if get_user_role(self.request.user) != "student":
            return Response(
                {
                    "status": "error",
                    "message": "Only students can register to a check-in session.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if student is already registered for this check-in session
        existing_record = Attendance.objects.filter(
            class_session=checkin_session.class_session, student=self.request.user
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
        course = class_session.course
        class_group = class_session.class_group

        # Check if student is in class
        is_in_class = ClassStudent.objects.filter(
            student=self.request.user, class_group=class_group
        ).exists()

        if not is_in_class:
            return Response(
                {
                    "status": "error",
                    "message": "You are not a member of this class.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check if the class is enrolled in the course
        is_class_enrolled = CourseClassEnrollment.objects.filter(
            course=course, class_group=class_group
        ).exists()

        if not is_class_enrolled:
            return Response(
                {
                    "status": "error",
                    "message": "Your class is not enrolled in this course.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        checked_in_at = timezone.now()
        late_at = checkin_session.started_at
        is_session_closed = (
            checkin_session.status == "closed"
            or checked_in_at > checkin_session.closed_at
        )

        if is_session_closed:
            return Response(
                {
                    "status": "error",
                    "message": "This check-in session is closed.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        elif checked_in_at > late_at:
            presence_status = "late"
            # Calculate minutes late
            time_diff = checked_in_at - late_at
            minutes_late = time_diff.seconds // 60
        else:
            presence_status = "present"
            minutes_late = 0

        attendance_record = Attendance.objects.create(
            student=self.request.user,
            class_session=class_session,
            status=presence_status,
            minutes_late=minutes_late,
            checked_in_at=checked_in_at,
        )

        serializer = AttendanceSerializer(attendance_record)
        return Response(serializer.data)

    @extend_schema(request=CheckinSessionInputSerializer)
    def create(self, request, *args, **kwargs):
        user_role = get_user_role(self.request.user)

        # Un étudiant n'est pas autorisé à créer une session d'appel
        if user_role == "student":
            return Response(
                {
                    "status": "error",
                    "message": "You are not authorized to perform this action.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        class_session_id = request.data.get("class_session")

        try:
            class_session = ClassSession.objects.get(id=class_session_id)

        except ClassSession.DoesNotExist:
            return Response(
                {"status": "error", "message": "Invalid class session."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        totp = TOTP()
        request.data["secret"] = totp.generate_secret()

        # Un professeur peut lancer une session d'appel uniquement pour les cours qu'il enseigne
        if (
            user_role == "teacher"
            and class_session.course.professor != self.request.user
        ):
            return Response(
                {
                    "status": "error",
                    "message": "You are not authorized to create a check-in session for this class session.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        checkin_session = serializer.save(status="active", created_by=request.user)

        # Crée la tâche Celery
        close_time = request.data["closed_at"]
        close_checkin_session.apply_async(
            args=[str(checkin_session.id)], eta=close_time
        )

        return Response(serializer.data)
