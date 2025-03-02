from django.contrib import admin
from schoolmarksapi.models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = (
        "class_session__course__name",
        "get_student_fullname",
        "checked_in_at",
        "status",
    )
    search_fields = ("student_id__email", "status")
    list_filter = ("status",)

    @admin.display(description="Student")
    def get_student_fullname(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"
