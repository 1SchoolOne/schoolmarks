from django.contrib import admin
from schoolmarksapi.models import AttendanceDetail, AttendanceRecord


@admin.register(AttendanceDetail)
class AttendanceDetailAdmin(admin.ModelAdmin):
    list_display = (
        "attendance_record_id",
        "student_id",
        "class_session_id",
        "course_id",
        "status",
        "checked_in_at",
        "minutes_late",
    )
    search_fields = ("student_id__email", "status", "course_id__name")
    list_filter = ("status",)


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("checkin_session_id", "student_id", "checked_in_at", "status")
    search_fields = ("student_id__email", "status")
    list_filter = ("status",)
