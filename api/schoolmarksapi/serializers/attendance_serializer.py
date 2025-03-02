from rest_framework import serializers
from schoolmarksapi.models import User, Attendance
from .user_serializer import UserSerializer


class AttendanceSerializer(serializers.ModelSerializer):
    student_detail = UserSerializer(source="student", read_only=True)
    student = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True
    )

    class Meta:
        model = Attendance
        fields = [
            "id",
            "class_session",
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
