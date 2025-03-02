from rest_framework import serializers
from drf_spectacular.utils import (
    extend_schema_field,
)


STATUS_CHOICES = ("processing", "completed", "failed")


class ImportSerializer(serializers.Serializer):
    file = serializers.FileField()


@extend_schema_field({"type": "array", "items": {"type": "object"}})
class JSONArrayField(serializers.JSONField):
    pass


class ImportResultsField(serializers.JSONField):
    class Meta:
        swagger_schema_fields = {
            "type": "array",
            "items": {
                "oneOf": [
                    {"$ref": "#/components/schemas/UserImportStatus"},
                    {"$ref": "#/components/schemas/ClassImportStatus"},
                    {"$ref": "#/components/schemas/CourseImportStatus"},
                ]
            },
        }


class ImportStatusSerializer(serializers.Serializer):
    TYPE_CHOICES = ("users", "classes", "courses")

    import_id = serializers.CharField()
    type = serializers.ChoiceField(choices=TYPE_CHOICES)
    status = serializers.ChoiceField(choices=STATUS_CHOICES)
    progress = serializers.IntegerField()
    imported_by = serializers.CharField()

    results = JSONArrayField()

    error = serializers.CharField(required=False, allow_null=True)
    warnings = serializers.ListField(
        child=serializers.CharField(), required=False, allow_null=True
    )
    finished_at = serializers.DateTimeField()
    started_at = serializers.DateTimeField()


class UserCSVRowSerializer(serializers.Serializer):
    ROLE_CHOICES = ("admin", "teacher", "student")

    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role = serializers.ChoiceField(choices=ROLE_CHOICES)
    username = serializers.CharField(required=False)
    birthday = serializers.CharField(required=False)


class ClassCSVRowSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    code = serializers.CharField(max_length=50)
    year_of_graduation = serializers.IntegerField()


class CourseCSVRowSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    code = serializers.CharField(max_length=50)
    teacher_email = serializers.EmailField()


class CreateImportResponse(serializers.Serializer):
    import_id = serializers.UUIDField()
    status = serializers.ChoiceField(choices=STATUS_CHOICES)
