from rest_framework import serializers
from schoolmarksapi.models import CourseClassEnrollment
from schoolmarksapi.serializers import ClassSerializer, CourseSerializer


class CourseClassEnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    class_group = ClassSerializer(read_only=True)
    checkin_session = serializers.SerializerMethodField()

    class Meta:
        model = CourseClassEnrollment
        fields = [
            "id",
            "course",
            "class_group",
            "enrolled_at",
        ]
