from django.contrib import admin
from schoolmarksapi.models import Class, ClassSession, ClassStudent


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "year_of_graduation")
    search_fields = ("name", "code")
    list_filter = ("year_of_graduation",)


@admin.register(ClassSession)
class ClassSessionAdmin(admin.ModelAdmin):
    list_display = (
        "course__name",
        "class_group__name",
        "date",
        "start_time",
        "end_time",
        "room",
    )
    search_fields = ("course__name", "class_group__name", "room")
    list_filter = ("date",)


@admin.register(ClassStudent)
class ClassStudentAdmin(admin.ModelAdmin):
    list_display = ("class_group__name", "student__email", "joined_at")
    search_fields = ("class_group__name", "student__email")
    list_filter = ("joined_at",)
