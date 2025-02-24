from rest_framework import serializers
from schoolmarksapi.models import Grade, StudentGrade
from schoolmarksapi.serializers.class_serializer import ClassSerializer


class StudentGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentGrade
        fields = [
            "id",
            "grade",
            "student",
            "value",
            "comment",
            "created_at",
            "updated_at",
        ]


class GradeSerializer(serializers.ModelSerializer):
    student_grades = StudentGradeSerializer(many=True, read_only=True)
    class_group = ClassSerializer(
        source="course.enrollments.first.class_group", read_only=True
    )

    class Meta:
        model = Grade
        fields = [
            "id",
            "course",
            "name",
            "max_value",
            "coef",
            "description",
            "class_group",
            "student_grades",
            "created_at",
            "updated_at",
        ]
