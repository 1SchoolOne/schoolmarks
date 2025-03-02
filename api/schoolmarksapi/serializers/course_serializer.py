from rest_framework import serializers
from schoolmarksapi.models import Course
from schoolmarksapi.serializers.user_serializer import UserSerializer


class CourseSerializer(serializers.ModelSerializer):
    professor = UserSerializer(read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "code",
            "professor",
            "created_at",
            "updated_at",
        ]


class CourseInputSerializer(serializers.ModelSerializer):
    professor_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Course
        fields = [
            "name",
            "code",
            "professor_id",
        ]
