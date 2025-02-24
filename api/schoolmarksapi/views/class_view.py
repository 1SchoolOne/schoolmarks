from django.db import transaction
from django.forms import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from datetime import datetime
from common.users import get_user_role
from schoolmarksapi.models import Class, ClassStudent, ClassSession
from schoolmarksapi.models.course_enrollment import CourseEnrollment
from schoolmarksapi.serializers import (
    ClassSerializer,
    ClassStudentSerializer,
    ClassSessionSerializer,
)
from schoolmarksapi.serializers import (
    ClassSessionDetailSerializer,
    UpdateClassStudentsSerializer,
)


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

    # Permet de mettre à jour la liste d'étudiants d'une classe
    # TODO: revoir la façon dont les étudiants sont ajoutés/supprimés
    @action(detail=True, methods=["put"])
    def update_students(self, request, pk=None):
        class_obj = self.get_object()

        # Validate input
        serializer = UpdateClassStudentsSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        student_ids = serializer.validated_data["student_ids"]

        # Verify all students exist
        User = get_user_model()
        existing_students = User.objects.filter(id__in=student_ids)
        if len(existing_students) != len(student_ids):
            return Response(
                {"error": "One or more student IDs are invalid"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                class_obj.students.all().delete()

                student_records = [
                    ClassStudent(
                        class_group=class_obj,
                        student_id=student_id,
                    )
                    for student_id in student_ids
                ]

                ClassStudent.objects.bulk_create(student_records)

                serializer = self.get_serializer(class_obj)
                return Response(serializer.data)

        except Exception as e:
            return Response({"error": e}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"])
    def bulk_delete(self, request):
        ids = request.data.get("ids", [])
        if not ids:
            return Response(
                {"detail": "No ids provided for deletion"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # First count how many classes match the IDs
        classes_to_delete = CourseEnrollment.objects.filter(id__in=ids)
        count = classes_to_delete.count()

        # Then delete them
        classes_to_delete.delete()

        return Response(
            {
                "detail": f"Successfully deleted {count} enrollments",
                "count": count,
            },
            status=status.HTTP_200_OK,
        )


class ClassStudentViewSet(viewsets.ModelViewSet):
    queryset = ClassStudent.objects.all()
    serializer_class = ClassStudentSerializer


class ClassSessionViewSet(viewsets.ModelViewSet):
    queryset = ClassSession.objects.all()
    serializer_class = ClassSessionSerializer

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
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if course_code:
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
            student_classes = ClassStudent.objects.filter(
                student=self.request.user
            ).values_list("class_group", flat=True)

            # Trouve les cours auxquels l'étudiant est inscrit
            enrolled_courses = CourseEnrollment.objects.filter(
                class_group__in=student_classes
            ).values_list("course", flat=True)

            return ClassSession.objects.filter(course__in=enrolled_courses)

    def get_serializer_class(self):
        if self.action == "create" or self.action == "update":
            return ClassSessionSerializer
        return ClassSessionDetailSerializer
