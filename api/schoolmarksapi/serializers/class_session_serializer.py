from rest_framework import serializers
from schoolmarksapi.models import ClassSession
from schoolmarksapi.serializers.class_serializer import ClassSerializer
from schoolmarksapi.serializers.course_serializer import CourseSerializer
from schoolmarksapi.serializers.checkin_session_serializer import (
    CheckinSessionSerializer,
)
from drf_spectacular.utils import extend_schema_field


class ClassSessionSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    class_group = ClassSerializer(read_only=True)
    checkin_session = serializers.SerializerMethodField()

    class Meta:
        model = ClassSession
        fields = [
            "id",
            "course",
            "class_group",
            "date",
            "start_time",
            "end_time",
            "room",
            "checkin_session",
        ]

    @extend_schema_field(CheckinSessionSerializer)
    def get_checkin_session(self, obj):
        checkin_session = obj.checkins.first()
        if checkin_session:
            return CheckinSessionSerializer(checkin_session).data
        return None


class ClassSessionInputSerializer(serializers.ModelSerializer):
    course_id = serializers.UUIDField(write_only=True)
    class_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ClassSession
        fields = ["course_id", "class_id", "date", "start_time", "end_time", "room"]
