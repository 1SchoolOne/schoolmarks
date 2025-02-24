from django.contrib import admin
from schoolmarksapi.models import Class, ClassSession, ClassStudent


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "year_of_graduation")
    search_fields = ("name", "code")
    list_filter = ("year_of_graduation",)


@admin.register(ClassSession)
class ClassSessionAdmin(admin.ModelAdmin):
    list_display = ("course_id", "date", "start_time", "end_time", "room", "status")
    search_fields = ("course_id__name", "room")
    list_filter = ("date", "status")


@admin.register(ClassStudent)
class ClassStudentAdmin(admin.ModelAdmin):
    list_display = ("class_group_id", "student_id")
    search_fields = ("class_group_id__name", "student_id__email")
