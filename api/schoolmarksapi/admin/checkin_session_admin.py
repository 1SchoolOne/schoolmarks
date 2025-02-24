from django.contrib import admin
from schoolmarksapi.models import CheckinSession


@admin.register(CheckinSession)
class CheckinSessionAdmin(admin.ModelAdmin):
    list_display = (
        "class_session_id",
        "started_at",
        "closed_at",
        "created_by",
        "status",
    )
    search_fields = ("class_session_id__course__name",)
    list_filter = ("status",)
