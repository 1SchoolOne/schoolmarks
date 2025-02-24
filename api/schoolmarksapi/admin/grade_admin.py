from django.contrib import admin
from schoolmarksapi.models import Grade, StudentGrade


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("name", "course", "max_value", "coef")
    search_fields = ("name", "course__name")
    list_filter = ("course", "created_at")


@admin.register(StudentGrade)
class StudentGradeAdmin(admin.ModelAdmin):
    list_display = ("student", "grade", "value", "created_at")
    search_fields = ("student__email", "grade__name")
    list_filter = ("grade", "created_at")
