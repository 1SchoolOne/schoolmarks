from rest_framework import serializers
from schoolmarksapi.models import ClassStudent
from schoolmarksapi.serializers import (
    UserSerializer,
    ClassSerializer,
)


class ClassStudentSerializer(serializers.ModelSerializer):
    class_group = ClassSerializer(read_only=True)
    student = UserSerializer(read_only=True)

    class Meta:
        model = ClassStudent
        fields = [
            "id",
            "class_group",
            "student",
            "joined_at",
        ]
