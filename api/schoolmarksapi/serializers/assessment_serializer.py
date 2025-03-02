from rest_framework import serializers
from django.db import transaction
from schoolmarksapi.models import Assessment, StudentGrade, Course, Class
from schoolmarksapi.serializers.class_serializer import ClassSerializer
from schoolmarksapi.serializers.course_serializer import CourseSerializer
from schoolmarksapi.serializers.student_grade_serializer import (
    StudentGradeSerializer,
    StudentGradeInputSerializer,
)


class AssessmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer()
    student_grades = StudentGradeSerializer(many=True, read_only=True)
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
            "student_grades",
            "created_at",
            "updated_at",
        ]


class AssessmentInputSerializer(serializers.Serializer):
    course_id = serializers.UUIDField(write_only=True, required=True, allow_null=False)
    class_id = serializers.UUIDField(write_only=True, required=True, allow_null=False)
    name = serializers.CharField(required=True)
    max_value = serializers.DecimalField(max_digits=5, decimal_places=2, required=True)
    coef = serializers.DecimalField(max_digits=5, decimal_places=2, required=True)
    description = serializers.CharField(
        required=False, allow_null=True, allow_blank=True
    )
    student_grades = serializers.ListField(
        child=StudentGradeInputSerializer(), required=False
    )

    def validate(self, data):
        """Validate assessment data"""
        # For assessment creation, validate course and class
        if "id" not in data or not data.get("id"):
            # Check if course exists
            try:
                Course.objects.get(pk=data["course_id"])
            except Course.DoesNotExist:
                raise serializers.ValidationError(
                    {"course_id": "Course does not exist"}
                )

            # Check if class exists
            try:
                Class.objects.get(pk=data["class_id"])
            except Class.DoesNotExist:
                raise serializers.ValidationError({"class_id": "Class does not exist"})

        # For assessment update, enforce that course_id and class_id cannot be changed
        else:
            try:
                assessment = Assessment.objects.get(pk=data["id"])

                # If course_id is provided and different from current, reject
                if "course_id" in data and str(assessment.course_id) != str(
                    data["course_id"]
                ):
                    raise serializers.ValidationError(
                        {"course_id": "Cannot change course for an existing assessment"}
                    )

                # If class_id is provided and different from current, reject
                if "class_id" in data and str(assessment.class_group_id) != str(
                    data["class_id"]
                ):
                    raise serializers.ValidationError(
                        {"class_id": "Cannot change class for an existing assessment"}
                    )

            except Assessment.DoesNotExist:
                raise serializers.ValidationError({"id": "Assessment does not exist"})

        # Validate coefficient
        if data.get("coef") and (data["coef"] <= 0 or data["coef"] > 100):
            raise serializers.ValidationError(
                {"coef": "Coefficient must be between 0 and 100"}
            )

        # Validate max_value
        if data.get("max_value") and data["max_value"] <= 0:
            raise serializers.ValidationError(
                {"max_value": "Maximum value must be positive"}
            )

        # Validate student grades if provided
        if "student_grades" in data and data["student_grades"]:
            for grade in data["student_grades"]:
                if grade["value"] > data["max_value"]:
                    raise serializers.ValidationError(
                        {
                            "student_grades": f"Grade for student {grade['student_id']} exceeds maximum value"
                        }
                    )

        return data

    @transaction.atomic
    def create(self, validated_data):
        """Create an assessment with associated student grades"""

        # Extract student grades data
        student_grades_data = validated_data.pop("student_grades", [])

        # Create assessment
        assessment = Assessment.objects.create(
            course_id=validated_data["course_id"],
            class_group_id=validated_data["class_id"],
            name=validated_data["name"],
            coef=validated_data["coef"],
            max_value=validated_data["max_value"],
            description=validated_data.get("description", ""),
        )

        # Create student grades
        for grade_data in student_grades_data:
            StudentGrade.objects.create(
                assessment=assessment,
                student_id=grade_data["student_id"],
                value=grade_data["value"],
                comment=grade_data.get("comment", ""),
            )

        # Only return the assessment
        return assessment

    @transaction.atomic
    def update(self, instance, validated_data):
        """Update an assessment and its associated student grades"""

        # Extract student grades data
        student_grades_data = validated_data.pop("student_grades", [])

        # Remove course_id and class_id from validated_data if present
        # These fields shouldn't be updated once the assessment is created
        validated_data.pop("course_id", None)
        validated_data.pop("class_id", None)

        # Update assessment fields
        instance.name = validated_data.get("name", instance.name)
        instance.coef = validated_data.get("coef", instance.coef)
        instance.max_value = validated_data.get("max_value", instance.max_value)
        instance.description = validated_data.get("description", instance.description)
        instance.save()

        # Update or create student grades
        for grade_data in student_grades_data:
            grade_id = grade_data.get("grade_id")
            if grade_id:
                # Update existing grade
                try:
                    grade = StudentGrade.objects.get(pk=grade_id, assessment=instance)
                    grade.value = grade_data["value"]
                    grade.comment = grade_data.get("comment", grade.comment)
                    grade.save()
                except StudentGrade.DoesNotExist:
                    # If grade with this ID doesn't exist, create a new one
                    StudentGrade.objects.create(
                        assessment=instance,
                        student_id=grade_data["student_id"],
                        value=grade_data["value"],
                        comment=grade_data.get("comment", ""),
                    )
            else:
                # Create new grade
                StudentGrade.objects.create(
                    assessment=instance,
                    student_id=grade_data["student_id"],
                    value=grade_data["value"],
                    comment=grade_data.get("comment", ""),
                )

        return instance
