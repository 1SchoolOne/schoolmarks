from rest_framework import serializers
from schoolmarksapi.models import Class, ClassStudent
from schoolmarksapi.serializers.user_serializer import UserSerializer
from drf_spectacular.utils import extend_schema_field


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
        class_students = obj.students.select_related("student")
        return UserSerializer([cs.student for cs in class_students], many=True).data


class ClassStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassStudent
        fields = ["id", "class_group", "student"]


class UpdateClassStudentsSerializer(serializers.Serializer):
    student_ids = serializers.ListField(child=serializers.IntegerField(), required=True)
