from django.db import models
from schoolmarksapi.models import User, Class
import uuid


class ClassStudent(models.Model):
    """Links students to their classes (independent of courses)"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_group = models.ForeignKey(
        Class, on_delete=models.CASCADE, related_name="student_memberships"
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="class_memberships"
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["class_group", "student"]]
        verbose_name = "Class Membership"
        verbose_name_plural = "Class Memberships"

    def __str__(self):
        return f"{self.student.username} in {self.class_group.code}"
