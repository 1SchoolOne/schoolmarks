from django.contrib import admin
from schoolmarksapi.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "username",
        "first_name",
        "last_name",
        "email",
        "birthday",
        "phone_number",
        "has_changed_password",
        "is_active",
        "is_staff",
        "is_superuser",
    )
    search_fields = ("username", "first_name", "last_name", "email", "phone_number")
