from rest_framework import serializers
from schoolmarksapi.models import StudentGrade, Assessment
from schoolmarksapi.serializers.user_serializer import UserSerializer
from schoolmarksapi.serializers.course_serializer import CourseSerializer
from schoolmarksapi.serializers.class_serializer import ClassSerializer


# Pour éviter des dépendances circulaires
class AssessmentWithoutGradesSerializer(serializers.ModelSerializer):
    course = CourseSerializer()
    class_group = ClassSerializer(read_only=True)

    class Meta:
        model = Assessment
        fields = [
            "id",
            "course",
            "name",
            "max_value",
            "coef",
            "description",
            "class_group",
            "created_at",
            "updated_at",
        ]


class StudentGradeSerializer(serializers.ModelSerializer):
    assessment = AssessmentWithoutGradesSerializer()
    student = UserSerializer()

    class Meta:
        model = StudentGrade
        fields = [
            "id",
            "assessment",
            "student",
            "value",
            "comment",
            "created_at",
            "updated_at",
        ]


class StudentGradeInputSerializer(serializers.Serializer):
    grade_id = serializers.UUIDField(required=False, allow_null=True)
    student_id = serializers.IntegerField(required=True)
    value = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
    )
    comment = serializers.CharField()

    def validate_value(self, value):
        """Validate that value is positive"""
        if value < 0:
            raise serializers.ValidationError("Grade value cannot be negative")
        return value
