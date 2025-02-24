from rest_framework import serializers
from schoolmarksapi.models import ClassSession
from schoolmarksapi.serializers import CheckinSessionSerializer, CourseSerializer
from drf_spectacular.utils import extend_schema_field


class ClassSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSession
        fields = ["id", "course", "date", "start_time", "end_time", "room", "status"]


class ClassSessionDetailSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    checkin_session = serializers.SerializerMethodField()

    class Meta:
        model = ClassSession
        fields = [
            "id",
            "course",
            "date",
            "start_time",
            "end_time",
            "room",
            "status",
            "checkin_session",
        ]

    @extend_schema_field(CheckinSessionSerializer)
    def get_checkin_session(self, obj):
        checkin_session = obj.checkins.first()
        if checkin_session:
            return CheckinSessionSerializer(checkin_session).data
        return None
