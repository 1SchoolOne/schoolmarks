from django.db import models
from schoolmarksapi.models import User, CheckinSession
import uuid


class AttendanceRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    checkin_session = models.ForeignKey(
        CheckinSession, on_delete=models.CASCADE, related_name="attendance_records"
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="attendance_records"
    )
    checked_in_at = models.DateTimeField()
    status = models.CharField(max_length=50)
