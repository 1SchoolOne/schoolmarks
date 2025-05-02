from rest_framework import serializers
from schoolmarksapi.models import (
    Class,
    ClassStudent,
    User,
    Course,
    CourseClassEnrollment,
)
from schoolmarksapi.serializers.user_serializer import UserSerializer
from drf_spectacular.utils import extend_schema_field
from django.db import transaction


class ClassSerializer(serializers.ModelSerializer):
    students = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = [
            "id",
            "students",
            "name",
            "code",
            "year_of_graduation",
            "created_at",
            "updated_at",
        ]

    @extend_schema_field(serializers.ListSerializer(child=UserSerializer()))
    def get_students(self, obj):
        # Get enrollments related to this class and prefetch the student data
        class_students = obj.student_memberships.select_related("student")
        # Serialize the students using UserSerializer
        return UserSerializer([cs.student for cs in class_students], many=True).data


class ClassInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=True)
    code = serializers.CharField(max_length=50, required=True)
    year_of_graduation = serializers.IntegerField(required=False, allow_null=True)

    def validate_code(self, value):
        # Check if code already exists when creating a new class
        instance = self.context.get("instance", None)

        queryset = Class.objects.filter(code=value)

        # If we are updating an instance, exclude it from the queryset
        if instance:
            queryset = queryset.exclude(pk=instance.pk)

        # If any classes match the code (excluding the current instance during update),
        # then the code is not unique.
        if queryset.exists():
            raise serializers.ValidationError("A class with this code already exists.")

        return value

    def validate_year_of_graduation(self, value):
        if value is not None and value < 2000:
            raise serializers.ValidationError(
                "Year of graduation must be greater than 2000."
            )
        return value


class BulkDeleteClassSerializer(serializers.Serializer):
    class_ids = serializers.ListField(child=serializers.UUIDField(), required=True)


class ClassStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassStudent
        fields = ["id", "class_group", "student"]


class ClassCreateWithStudentsSerializer(serializers.Serializer):
    class_id = serializers.UUIDField(
        required=False,
        help_text="ID de la classe à mettre à jour (requis pour les requêtes PUT)",
    )
    class_data = ClassInputSerializer()
    student_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        help_text="Liste des étudiants à ajouter à la classe",
    )
    course_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=True,
        help_text="Liste des cours à assigner à la classe",
    )

    @transaction.atomic
    def create(self, validated_data):
        # Extract the class data, student IDs, and course IDs
        class_data = validated_data.pop("class_data")
        student_ids = validated_data.pop("student_ids", [])
        course_ids = validated_data.pop("course_ids", [])

        # Create the class
        class_instance = Class.objects.create(**class_data)

        # Get the students and courses
        students = User.objects.filter(id__in=student_ids)
        courses = Course.objects.filter(id__in=course_ids)

        for student in students:
            ClassStudent.objects.create(class_group=class_instance, student=student)

        for course in courses:
            CourseClassEnrollment.objects.create(
                course=course, class_group=class_instance
            )

        return {
            "class": class_instance,
            "added_students": len(students),
            "added_courses": len(courses),
        }

    def update(self, instance, validated_data):
        class_data = validated_data.get("class_data")
        student_ids = validated_data.get("student_ids", [])
        course_ids = validated_data.get("course_ids", [])

        if class_data:
            # Update fields on the instance from class_data
            for attr, value in class_data.items():
                setattr(instance, attr, value)
            instance.save()

        if (
            student_ids is not None
        ):  # Check specifically for None to allow clearing students
            new_student_ids = set(student_ids)
            current_student_ids = set(
                ClassStudent.objects.filter(class_group=instance)
                .values_list("student_id", flat=True)
                .distinct()
            )

            # Calculate the differences
            to_add = new_student_ids - current_student_ids
            to_remove = current_student_ids - new_student_ids

            if to_remove:
                ClassStudent.objects.filter(
                    class_group=instance, student_id__in=to_remove
                ).delete()

            if to_add:
                new_enrollments = [
                    ClassStudent(class_group=instance, student_id=student_id)
                    for student_id in to_add
                ]

                ClassStudent.objects.bulk_create(new_enrollments)

        # Update courses if provided
        if (
            course_ids is not None
        ):  # Check specifically for None to allow clearing courses
            new_course_ids = set(course_ids)

            current_course_ids = set(
                Course.objects.filter(classes__class_group=instance)
                .values_list("id")
                .distinct()
            )

            # Calculate the differences
            to_add = new_course_ids - current_course_ids
            to_remove = current_course_ids - new_course_ids

            if to_remove:
                CourseClassEnrollment.objects.filter(
                    class_group=instance, course_id__in=to_remove
                ).delete()

            if to_add:
                new_enrollments = [
                    CourseClassEnrollment(class_group=instance, course_id=course_id)
                    for course_id in to_add
                ]

                CourseClassEnrollment.objects.bulk_create(new_enrollments)

        # Return the updated instance and information about the changes
        return {
            "class": instance,
            "updated_students_count": len(student_ids)
            if student_ids is not None
            else None,
            "updated_courses_count": len(course_ids)
            if course_ids is not None
            else None,
        }


class UpdateClassCoursesSerializer(serializers.Serializer):
    course_ids = serializers.ListField(child=serializers.UUIDField())


class UpdateClassStudentsSerializer(serializers.Serializer):
    student_ids = serializers.ListField(child=serializers.IntegerField(), required=True)
