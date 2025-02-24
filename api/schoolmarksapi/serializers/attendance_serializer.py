from rest_framework import serializers
from schoolmarksapi.models import AttendanceDetail, AttendanceRecord
from schoolmarksapi.models.user import User
from .user_serializer import UserSerializer


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_detail = UserSerializer(source="student", read_only=True)
    student = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True
    )

    class Meta:
        model = AttendanceRecord
        fields = [
            "id",
            "checkin_session",
            "student",
            "student_detail",
            "checked_in_at",
            "status",
        ]

    def to_representation(self, instance):
        # Convert the write-only student field to the read-only nested representation
        ret = super().to_representation(instance)
        ret["student"] = ret.pop("student_detail")
        return ret


class AttendanceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceDetail
        fields = [
            "id",
            "attendance_record",
            "student",
            "class_session",
            "course",
            "status",
            "checked_in_at",
            "minutes_late",
            "created_at",
        ]
