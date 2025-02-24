from django.contrib import admin
from schoolmarksapi.models import Course, CourseEnrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "professor_id")
    search_fields = ("name", "code", "professor_id__email")
    list_filter = ("professor_id",)


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("course_id", "class_group_id", "enrolled_at")
    search_fields = ("course_id__name", "class_group_id__name")
