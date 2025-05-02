from django.db import transaction
from rest_framework import viewsets, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from drf_spectacular.utils import (
    extend_schema,
    OpenApiResponse,
    inline_serializer,
    OpenApiParameter,
)
from drf_spectacular.types import OpenApiTypes
from common.users import get_user_role
from schoolmarksapi.models import (
    Class,
    ClassStudent,
    User,
    Course,
    CourseClassEnrollment,
)
from schoolmarksapi.serializers import (
    ClassSerializer,
    ClassInputSerializer,
    ClassStudentSerializer,
    BulkDeleteClassSerializer,
    UpdateClassStudentsSerializer,
    ClassCreateWithStudentsSerializer,
    UserSerializer,
    CourseSerializer,
    UpdateClassCoursesSerializer,
)


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

    def get_serializer_class(self):
        if self.action == "update_courses":
            return UpdateClassCoursesSerializer
        if self.action == "update_students":
            return UpdateClassStudentsSerializer
        if self.action == "with_students":
            return ClassCreateWithStudentsSerializer
        elif self.action == "bulk_delete":
            return BulkDeleteClassSerializer
        elif self.action == "create":
            return ClassInputSerializer

        return super().get_serializer_class()

    def get_queryset(self):
        queryset = self._get_role_based_queryset()

        # Get query parameters
        name = self.request.query_params.get("name")
        code = self.request.query_params.get("code")

        # Apply filters if parameters are provided
        if name:
            queryset = queryset.filter(name__icontains=name)

        if code:
            queryset = queryset.filter(code__icontains=code)

        return queryset

    def _get_role_based_queryset(self):
        user_role = get_user_role(self.request.user)

        if user_role == "admin":
            return Class.objects.all()

        if user_role == "teacher":
            # Get all courses taught by this teacher
            teacher_courses = Course.objects.filter(professor=self.request.user)

            # Get all classes enrolled in these courses
            class_ids = (
                CourseClassEnrollment.objects.filter(course__in=teacher_courses)
                .values_list("class_group_id", flat=True)
                .distinct()
            )

            return Class.objects.filter(id__in=class_ids)

        if user_role == "student":
            return Class.objects.filter(student_memberships__student=self.request.user)

        return Class.objects.none()

    @extend_schema(
        request=BulkDeleteClassSerializer,
        responses={
            200: inline_serializer(
                name="BulkDeleteClassResponseSerializer",
                fields={
                    "detail": serializers.CharField(),
                    "count": serializers.IntegerField(
                        help_text="Number of classes deleted"
                    ),
                },
            )
        },
    )
    @action(detail=False, methods=["post"])
    def bulk_delete(self, request):
        class_ids = request.data.get("class_ids", [])
        if not class_ids:
            return Response(
                {"detail": "No class ids provided for deletion"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # First count how many classes match the IDs
        classes_to_delete = Class.objects.filter(id__in=class_ids)
        count = classes_to_delete.count()

        # Then delete them
        classes_to_delete.delete()

        return Response(
            {
                "detail": f"Successfully deleted {count} classes",
                "count": count,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        request=ClassCreateWithStudentsSerializer,
        responses=inline_serializer(
            name="ClassCreateWithStudentsResponseSerializer",
            fields={
                "class": ClassSerializer(),
                "added_students": serializers.IntegerField(),
                "added_courses": serializers.IntegerField(),
            },
        ),
    )
    @action(detail=False, methods=["post", "put"])
    def with_students(self, request):
        """Crée une classe et ajouter les étudiants en une opération"""

        if request.method == "POST":
            serializer = self.get_serializer(data=request.data)

            if serializer.is_valid():
                result = serializer.save()
                return Response(
                    {
                        "class": ClassSerializer(result["class"]).data,
                        "added_students": result["added_students"],
                        "added_courses": result["added_courses"],
                    },
                    status=status.HTTP_201_CREATED,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == "PUT":
            # For PUT, you need to get the instance to update.
            # You can get the class_id from the request data.
            class_id = request.data.get("class_id")

            if not class_id:
                return Response(
                    {"class_id": "This field is required for PUT requests."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                class_instance = Class.objects.get(id=class_id)
            except Class.DoesNotExist:
                return Response(
                    {"detail": "Class not found."}, status=status.HTTP_404_NOT_FOUND
                )

            serializer = self.get_serializer(
                class_instance,
                data=request.data,
                partial=True,
                context={"instance": class_instance},
            )  # Use partial=True to allow partial updates
            if serializer.is_valid():
                result = serializer.save()

                return Response(
                    {
                        "class": ClassSerializer(result["class"]).data,
                        "updated_students_count": result["updated_students_count"],
                        "updated_courses_count": result["updated_courses_count"],
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=UpdateClassStudentsSerializer,
        responses=ClassSerializer,
    )
    @action(detail=True, methods=["post"])
    def update_students(self, request, pk=None):
        """Met à jour la liste des étudiants d'une classe."""
        class_instance = self.get_object()

        # Validate input
        input_serializer = UpdateClassStudentsSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_student_ids = set(input_serializer.validated_data["student_ids"])

        current_student_ids = set(
            ClassStudent.objects.filter(class_group=class_instance)
            .values_list("student_id", flat=True)
            .distinct()
        )

        # Calculate the differences
        to_add = new_student_ids - current_student_ids
        to_remove = current_student_ids - new_student_ids

        try:
            with transaction.atomic():
                if to_remove:
                    ClassStudent.objects.filter(
                        class_group=class_instance, student_id__in=to_remove
                    ).delete()

                if to_add:
                    new_enrollments = [
                        ClassStudent(class_group=class_instance, student_id=student_id)
                        for student_id in to_add
                    ]

                    ClassStudent.objects.bulk_create(new_enrollments)

                serializer = ClassSerializer(class_instance)
                return Response(serializer.data)

        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Error updating students for class {pk}: {str(e)}")

            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=UpdateClassCoursesSerializer,
        responses=ClassSerializer,
    )
    @action(detail=True, methods=["post"])
    def update_courses(self, request, pk=None):
        class_instance = self.get_object()

        # Validate input
        input_serializer = UpdateClassCoursesSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_course_ids = set(input_serializer.validated_data["course_ids"])

        current_course_ids = set(
            Course.objects.filter(classes__class_group=class_instance)
            .values_list("id")
            .distinct()
        )

        # Calculate the differences
        to_add = new_course_ids - current_course_ids
        to_remove = current_course_ids - new_course_ids

        try:
            with transaction.atomic():
                if to_remove:
                    CourseClassEnrollment.objects.filter(
                        class_group=class_instance, course_id__in=to_remove
                    ).delete()

                if to_add:
                    new_enrollments = [
                        CourseClassEnrollment(
                            class_group=class_instance, course_id=course_id
                        )
                        for course_id in to_add
                    ]

                    CourseClassEnrollment.objects.bulk_create(new_enrollments)

                serializer = ClassSerializer(class_instance)
                return Response(serializer.data)

        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Error updating courses for class {pk}: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses=OpenApiResponse(
            response=UserSerializer(many=True),
            description="List of students in this class",
        )
    )
    @action(detail=True, methods=["get"])
    def students(self, request, pk=None):
        """Get all students in this class"""
        class_instance = self.get_object()

        students = User.objects.filter(class_memberships__class_group=class_instance)

        serializer = UserSerializer(students, many=True)

        return Response(serializer.data)

    @extend_schema(
        responses=OpenApiResponse(
            response=CourseSerializer(many=True),
            description="List of courses this class attends to",
        )
    )
    @action(detail=True, methods=["get"])
    def courses(self, request, pk=None):
        """Get all courses this class attends to"""
        class_instance = self.get_object()

        courses = Course.objects.filter(classes__class_group=class_instance).distinct()

        serializer = CourseSerializer(courses, many=True)

        return Response(serializer.data)

    @extend_schema(
        parameters=[
            OpenApiParameter("name", OpenApiTypes.STR, OpenApiParameter.QUERY),
            OpenApiParameter("code", OpenApiTypes.STR, OpenApiParameter.QUERY),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class ClassStudentViewSet(viewsets.ModelViewSet):
    queryset = ClassStudent.objects.all()
    serializer_class = ClassStudentSerializer
