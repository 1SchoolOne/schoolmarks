from rest_framework import serializers
from schoolmarksapi.models import CheckinSession


class CheckinSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckinSession
        fields = [
            "id",
            "class_session",
            "started_at",
            "closed_at",
            "created_by",
            "status",
        ]


class CheckinSessionInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckinSession
        fields = [
            "class_session",
            "started_at",
            "closed_at",
            "created_by",
            "status",
        ]
