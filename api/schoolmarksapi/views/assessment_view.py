from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from schoolmarksapi.models import Course
from common.users import get_user_role
from schoolmarksapi.models import Assessment
from schoolmarksapi.serializers import (
    AssessmentSerializer,
    AssessmentInputSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes


class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["course"]
    search_fields = ["name"]
    ordering_fields = ["created_at", "name"]
    http_method_names = ["get", "post", "put", "delete"]

    def get_serializer_class(self):
        if self.action == "create" or self.action == "update":
            return AssessmentInputSerializer

        return super().get_serializer_class()

    @extend_schema(
        request=AssessmentInputSerializer, responses={201: AssessmentSerializer}
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            result = serializer.create(validated_data=serializer.validated_data)
            data = AssessmentSerializer(result).data
            return Response(data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=AssessmentInputSerializer, responses={201: AssessmentSerializer}
    )
    def update(self, request, pk=None):
        """Update an existing assessment with student grades"""
        assessment_instance = self.get_object()

        if assessment_instance.course.professor != self.request.user:
            return Response(
                {"detail": "You do not have the permission to update this assessment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Add the assessment ID to the data
        data = request.data.copy()
        data["id"] = pk

        serializer = AssessmentInputSerializer(data=data)

        if serializer.is_valid():
            updated_assessment = serializer.update(
                assessment_instance, serializer.validated_data
            )
            data = AssessmentSerializer(updated_assessment).data

            return Response(data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        parameters=[
            OpenApiParameter("course_id", OpenApiTypes.UUID, OpenApiParameter.QUERY),
            OpenApiParameter("class_id", OpenApiTypes.UUID, OpenApiParameter.QUERY),
            OpenApiParameter(
                "month",
                OpenApiTypes.INT,
                OpenApiParameter.QUERY,
                description="Month (1-12)",
            ),
            OpenApiParameter(
                "year",
                OpenApiTypes.INT,
                OpenApiParameter.QUERY,
                description="Year (e.g., 2024)",
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        course_id = self.request.query_params.get("course_id", None)
        class_id = self.request.query_params.get("class_id", None)

        if course_id:
            queryset = queryset.filter(course_id=course_id)

        if class_id:
            queryset = queryset.filter(class_group_id=class_id)

        # Filter by month and year
        month = self.request.query_params.get("month", None)
        year = self.request.query_params.get("year", None)

        if month and year:
            try:
                month = int(month)
                year = int(year)

                # Validate month value
                if month < 1 or month > 12:
                    return Response(
                        {"error": "Month must be between 1 and 12"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # TODO: adapter le filtre au champ assessment_date
                # Filter assessments by month and year
                queryset = queryset.filter(
                    created_at__month=month, created_at__year=year
                )
            except ValueError:
                return Response(
                    {"error": "Month and year must be valid integers"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif month:
            try:
                month = int(month)

                # Validate month value
                if month < 1 or month > 12:
                    return Response(
                        {"error": "Month must be between 1 and 12"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # TODO: adapter le filtre au champ assessment_date
                # Filter assessments by month only
                queryset = queryset.filter(created_at__month=month)
            except ValueError:
                return Response(
                    {"error": "Month must be a valid integer"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif year:
            try:
                year = int(year)

                # TODO: adapter le filtre au champ assessment_date
                # Filter assessments by year only
                queryset = queryset.filter(created_at__year=year)
            except ValueError:
                return Response(
                    {"error": "Year must be a valid integer"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = self.get_serializer(queryset, many=True)

        return Response(serializer.data)

    def get_queryset(self):
        return self._get_role_based_queryset()

    def _get_role_based_queryset(self):
        user_role = get_user_role(self.request.user)

        if user_role == "admin":
            # Retourne toutes les évaluations de cours
            return Assessment.objects.all()

        if user_role == "teacher":
            # Retourne uniquement les évaluations de cours que le prof donne
            return Assessment.objects.filter(course__professor_id=self.request.user.id)

        if user_role == "student":
            # Trouve les cours auxquels l'étudiant est inscrit
            enrolled_courses = Course.objects.filter(
                classes__class_group__student_memberships__student=self.request.user
            )

            # Retourne uniquement les évaluations de cours assignés à la classe de l'étudiant
            return Assessment.objects.filter(course__in=enrolled_courses)
