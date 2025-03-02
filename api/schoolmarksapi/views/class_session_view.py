from django.forms import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.response import Response
from datetime import datetime
from common.users import get_user_role
from schoolmarksapi.models import ClassSession, Class
from schoolmarksapi.serializers import (
    ClassSessionSerializer,
    ClassSessionInputSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes


class ClassSessionViewSet(viewsets.ModelViewSet):
    queryset = ClassSession.objects.all()
    serializer_class = ClassSessionSerializer

    def get_serializer_class(self):
        if self.action == "create" or self.action == "update":
            return ClassSessionInputSerializer
        return ClassSessionSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter("course_id", OpenApiTypes.UUID, OpenApiParameter.QUERY),
            OpenApiParameter("course_code", OpenApiTypes.STR, OpenApiParameter.QUERY),
            OpenApiParameter("start_date", OpenApiTypes.DATE, OpenApiParameter.QUERY),
            OpenApiParameter("end_date", OpenApiTypes.DATE, OpenApiParameter.QUERY),
        ]
    )
    def list(self, request, *args, **kwargs):
        checkin_session_id = request.query_params.get("checkin_session_id")
        if checkin_session_id:
            instance = get_object_or_404(
                ClassSession.objects.select_related("course", "course__professor"),
                checkins__id=checkin_session_id,
            )
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = self._get_role_based_queryset()

        # Filtre interval de date.
        # Exemple: récupérer les sessions de cours du 20/01/2025 au 25/01/2025
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        if start_date or end_date:
            try:
                if start_date:
                    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
                    queryset = queryset.filter(date__gte=start_date)
                if end_date:
                    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
                    queryset = queryset.filter(date__lte=end_date)
            except ValueError:
                raise ValidationError({"date": "Invalid date format. Use YYYY-MM-DD"})

        # Filtre cours
        # Exemple: récupérer toutes les sessions du cours "Micro Services"
        course_id = self.request.query_params.get("course_id")
        course_code = self.request.query_params.get("course_code")

        if course_id or course_code:
            if course_id:
                queryset = queryset.filter(course_id=course_id)
            elif course_code:
                queryset = queryset.filter(course__code__iexact=course_code)

        return queryset.select_related("course", "course__professor")

    def _get_role_based_queryset(self):
        user_role = get_user_role(self.request.user)

        if user_role == "admin":
            # Retourne toutes les sessions de cours
            return ClassSession.objects.all()

        if user_role == "teacher":
            # Retourne uniquement les sessions de cours que le prof donne
            return ClassSession.objects.filter(course__professor=self.request.user)

        if user_role == "student":
            # Trouve les classes auxquelles l'étudiant est inscrit
            enrolled_classes = Class.objects.filter(
                student_memberships__student=self.request.user
            )

            # Filtre pour envoyer uniquement les sessions correspondantes aux classes de l'étudiant
            return ClassSession.objects.filter(class_group__in=enrolled_classes)
