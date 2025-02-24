from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from schoolmarksapi.models import CheckinSession
from schoolmarksapi.models.class_session import ClassSession
from schoolmarksapi.serializers import CheckinSessionSerializer
from common.users import get_user_role
from common.utils import TOTP

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
