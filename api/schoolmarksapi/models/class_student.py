from django.db import models
from schoolmarksapi.models import User, Class
import uuid


class ClassStudent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_group = models.ForeignKey(
        Class, on_delete=models.CASCADE, related_name="students"
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="class_memberships"
    )
