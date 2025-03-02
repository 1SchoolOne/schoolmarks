from django.contrib import admin
from schoolmarksapi.models import Assessment, StudentGrade


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ("name", "course", "class_group", "max_value", "coef")
    search_fields = ("name", "course__name", "class_group__name")
    list_filter = ("course", "class_group", "created_at")


@admin.register(StudentGrade)
class StudentGradeAdmin(admin.ModelAdmin):
    list_display = ("student", "assessment", "value", "created_at")
    search_fields = ("student__email", "assessment__name")
    list_filter = ("assessment", "created_at")
