from rest_framework import serializers
from schoolmarksapi.models import Course, CourseEnrollment
from schoolmarksapi.serializers.class_serializer import ClassSerializer
from schoolmarksapi.serializers.user_serializer import UserSerializer


class CourseSerializer(serializers.ModelSerializer):
    professor = UserSerializer(read_only=True)
    professor_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "code",
            "professor",
            "professor_id",
            "created_at",
            "updated_at",
        ]


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    class_group = ClassSerializer(read_only=True)
    course_id = serializers.UUIDField(write_only=True, required=True)
    class_group_id = serializers.UUIDField(write_only=True, required=True)

    class Meta:
        model = CourseEnrollment
        fields = [
            "id",
            "course_id",
            "class_group_id",
            "course",
            "class_group",
            "enrolled_at",
        ]
