from django.contrib import admin
from schoolmarksapi.models import CheckinSession


@admin.register(CheckinSession)
class CheckinSessionAdmin(admin.ModelAdmin):
    list_display = (
        "class_session__course__name",
        "class_session__class_group__name",
        "started_at",
        "closed_at",
        "created_by",
        "status",
    )
    search_fields = (
        "class_session__course__name",
        "class_session__class_group__name",
    )
    list_filter = ("status",)
