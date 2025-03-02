from django.contrib import admin
from schoolmarksapi.models import Course, CourseClassEnrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "professor_id")
    search_fields = ("name", "code", "professor_id__email")
    list_filter = ("professor_id",)


@admin.register(CourseClassEnrollment)
class CourseClassEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("course__name", "class_group__name", "enrolled_at")
    search_fields = ("course__name", "class_group__name")
