from django.db import models
from schoolmarksapi.models import User, ClassSession
import uuid


class Attendance(models.Model):
    STATUS_CHOICES = [
        ("present", "Présent"),
        ("late", "En retard"),
        ("absent", "Absent"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="attendances"
    )
    class_session = models.ForeignKey(
        ClassSession, on_delete=models.CASCADE, related_name="attendances"
    )
    status = models.CharField(choices=STATUS_CHOICES, max_length=20)
    checked_in_at = models.DateTimeField()
    minutes_late = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["student", "class_session"]
